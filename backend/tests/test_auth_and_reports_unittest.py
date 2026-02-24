from __future__ import annotations

import os
import tempfile
import unittest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("DATABASE_URL", "sqlite:///./tests_bootstrap.db")
os.environ.setdefault("AUTO_CREATE_TABLES", "false")

import models  # noqa: E402,F401
import routers.homepage as homepage_router  # noqa: E402
from database.connect import Base, get_db  # noqa: E402
from main import app  # noqa: E402


class BackendIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp_file = tempfile.NamedTemporaryFile(suffix=".sqlite3", delete=False)
        cls._tmp_file.close()
        cls.test_engine = create_engine(
            f"sqlite:///{cls._tmp_file.name}",
            connect_args={"check_same_thread": False},
        )
        Base.metadata.create_all(bind=cls.test_engine)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.test_engine)

        def override_get_db():
            db = cls.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()
        cls.client.close()
        Base.metadata.drop_all(bind=cls.test_engine)
        cls.test_engine.dispose()
        if os.path.exists(cls._tmp_file.name):
            os.unlink(cls._tmp_file.name)

    def setUp(self):
        db = self.SessionLocal()
        try:
            db.query(models.AIJob).delete()
            db.query(models.PotholeReport).delete()
            db.query(models.User).delete()
            db.commit()
        finally:
            db.close()

        async def fake_upload_pothole_image(file_content, filename, image_type, case_id):
            return {
                "success": True,
                "secure_url": f"https://example.test/{case_id}/{image_type}.jpg",
                "public_id": f"{case_id}/{image_type}",
            }

        async def fake_delete_image(public_id):
            return {"success": True}

        async def fake_process_ai_job(*args, **kwargs):
            return None

        homepage_router.CloudinaryService.upload_pothole_image = staticmethod(fake_upload_pothole_image)
        homepage_router.CloudinaryService.delete_image = staticmethod(fake_delete_image)
        homepage_router.SupabaseStorageService.is_configured = classmethod(lambda cls: False)
        homepage_router.process_ai_job = fake_process_ai_job

    def _register_and_login(self, email: str = "user@example.com", password: str = "Passw0rd!"):
        register_response = self.client.post(
            "/api/users/register",
            json={
                "email": email,
                "password": password,
                "full_name": "Test User",
            },
        )
        self.assertEqual(register_response.status_code, 201, register_response.text)

        login_response = self.client.post(
            "/api/users/login",
            data={"username": email, "password": password},
        )
        self.assertEqual(login_response.status_code, 200, login_response.text)
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_auth_register_login_and_get_me(self):
        headers = self._register_and_login()
        me_response = self.client.get("/api/users/me", headers=headers)
        self.assertEqual(me_response.status_code, 200, me_response.text)
        payload = me_response.json()
        self.assertEqual(payload["email"], "user@example.com")
        self.assertTrue(payload["id"] > 0)
        self.assertTrue(payload["is_active"])

    def test_report_submit_and_ai_status(self):
        headers = self._register_and_login()

        submit_response = self.client.post(
            "/api/homepage/report",
            headers=headers,
            data={
                "district": "kota-kinabalu",
                "latitude": "5.9804",
                "longitude": "116.0735",
                "address": "Jalan Tun Fuad Stephens",
                "description": "Large pothole near intersection",
            },
            files={
                "photo_1": ("top.jpg", b"image-top", "image/jpeg"),
                "photo_2": ("far.jpg", b"image-far", "image/jpeg"),
                "photo_3": ("close.jpg", b"image-close", "image/jpeg"),
            },
        )
        self.assertEqual(submit_response.status_code, 200, submit_response.text)
        case_id = submit_response.json()["case_id"]
        self.assertTrue(case_id.startswith("SRC-"))

        status_response = self.client.get(f"/api/homepage/report/{case_id}/ai-status", headers=headers)
        self.assertEqual(status_response.status_code, 200, status_response.text)
        status_payload = status_response.json()
        self.assertEqual(status_payload["case_id"], case_id)
        self.assertIn(
            status_payload["ai_queue"]["status"],
            ("QUEUED", "PROCESSING", "RETRYING", "COMPLETED", "FAILED"),
        )

    def test_nearby_reports_endpoint(self):
        headers = self._register_and_login()

        def submit_at(lat: str, lng: str, suffix: str):
            response = self.client.post(
                "/api/homepage/report",
                headers=headers,
                data={
                    "district": "kota-kinabalu",
                    "latitude": lat,
                    "longitude": lng,
                    "address": f"Point {suffix}",
                    "description": f"Report {suffix}",
                },
                files={
                    "photo_1": (f"top-{suffix}.jpg", b"image-top", "image/jpeg"),
                    "photo_2": (f"far-{suffix}.jpg", b"image-far", "image/jpeg"),
                    "photo_3": (f"close-{suffix}.jpg", b"image-close", "image/jpeg"),
                },
            )
            self.assertEqual(response.status_code, 200, response.text)
            return response.json()["case_id"]

        near_case = submit_at("5.9804", "116.0735", "near")
        submit_at("5.9900", "116.0900", "far")

        nearby_response = self.client.get(
            "/api/homepage/reports/nearby",
            headers=headers,
            params={
                "lat": 5.9804,
                "lng": 116.0735,
                "radius": 300,
                "hours": 72,
                "include_my_reports": True,
            },
        )
        self.assertEqual(nearby_response.status_code, 200, nearby_response.text)
        payload = nearby_response.json()
        returned_case_ids = {item["case_id"] for item in payload["reports"]}
        self.assertIn(near_case, returned_case_ids)
        self.assertGreaterEqual(payload["summary"]["count"], 1)


if __name__ == "__main__":
    unittest.main()

