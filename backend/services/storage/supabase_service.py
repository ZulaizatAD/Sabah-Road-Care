import mimetypes
import os
import re
from typing import Any, Dict, Optional
from urllib.parse import quote

try:
    from supabase import Client, create_client
except Exception:  # pragma: no cover - optional dependency in local dev
    Client = Any  # type: ignore
    create_client = None  # type: ignore


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "pothole-images")
SUPABASE_STORAGE_PREFIX = os.getenv("SUPABASE_STORAGE_PREFIX", "reports")
SUPABASE_SIGNED_UPLOAD_EXPIRES_IN = int(
    os.getenv("SUPABASE_SIGNED_UPLOAD_EXPIRES_IN", "900")
)


def _safe_segment(raw: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9._-]+", "-", (raw or "").strip())
    return cleaned.strip(".-") or "file"


class SupabaseStorageService:
    _client: Optional[Client] = None

    @classmethod
    def is_configured(cls) -> bool:
        return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and create_client)

    @classmethod
    def _get_client(cls) -> Optional[Client]:
        if not cls.is_configured():
            return None
        if cls._client is None:
            cls._client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        return cls._client

    @classmethod
    def _public_url(cls, object_path: str) -> Optional[str]:
        if not SUPABASE_URL:
            return None
        encoded = quote(object_path)
        return (
            f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/"
            f"{SUPABASE_STORAGE_BUCKET}/{encoded}"
        )

    @classmethod
    def build_object_path(cls, case_id: str, image_slot: str, filename: str) -> str:
        slot = _safe_segment(image_slot.lower())
        safe_name = _safe_segment(filename)
        stem, ext = os.path.splitext(safe_name)
        ext = ext.lower() or ".jpg"
        return (
            f"{SUPABASE_STORAGE_PREFIX.rstrip('/')}/{_safe_segment(case_id)}/"
            f"{slot}_{stem}{ext}"
        )

    @classmethod
    async def create_signed_upload_url(
        cls, case_id: str, image_slot: str, filename: str
    ) -> Dict[str, Any]:
        client = cls._get_client()
        if client is None:
            return {
                "success": False,
                "error": (
                    "Supabase storage is not configured. "
                    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
                ),
            }

        object_path = cls.build_object_path(case_id, image_slot, filename)
        try:
            storage_bucket = client.storage.from_(SUPABASE_STORAGE_BUCKET)
            try:
                data = storage_bucket.create_signed_upload_url(
                    object_path, SUPABASE_SIGNED_UPLOAD_EXPIRES_IN
                )
            except TypeError:
                data = storage_bucket.create_signed_upload_url(object_path)

            if isinstance(data, (list, tuple)) and data:
                data = data[0]
            if not isinstance(data, dict):
                raise ValueError(f"Unexpected signed upload response: {type(data).__name__}")

            resolved_path = data.get("path") or object_path
            signed_url = data.get("signed_url") or data.get("signedURL")
            if signed_url and signed_url.startswith("/"):
                signed_url = f"{SUPABASE_URL.rstrip('/')}{signed_url}"

            return {
                "success": True,
                "bucket": SUPABASE_STORAGE_BUCKET,
                "object_path": resolved_path,
                "signed_url": signed_url,
                "token": data.get("token"),
                "expires_in_seconds": SUPABASE_SIGNED_UPLOAD_EXPIRES_IN,
                "public_url": cls._public_url(resolved_path),
            }
        except Exception as exc:
            return {"success": False, "error": str(exc)}

    @classmethod
    async def upload_bytes(
        cls, file_content: bytes, case_id: str, image_slot: str, filename: str
    ) -> Dict[str, Any]:
        client = cls._get_client()
        if client is None:
            return {
                "success": False,
                "error": (
                    "Supabase storage is not configured. "
                    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
                ),
            }

        object_path = cls.build_object_path(case_id, image_slot, filename)
        content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        try:
            storage_bucket = client.storage.from_(SUPABASE_STORAGE_BUCKET)
            try:
                storage_bucket.upload(
                    path=object_path,
                    file=file_content,
                    file_options={"content-type": content_type, "upsert": "true"},
                )
            except TypeError:
                storage_bucket.upload(
                    object_path,
                    file_content,
                    {"content-type": content_type, "upsert": "true"},
                )
            return {
                "success": True,
                "bucket": SUPABASE_STORAGE_BUCKET,
                "object_path": object_path,
                "public_url": cls._public_url(object_path),
            }
        except Exception as exc:
            return {"success": False, "error": str(exc)}

    @classmethod
    async def delete_object(cls, object_path: str) -> Dict[str, Any]:
        client = cls._get_client()
        if client is None:
            return {"success": False, "error": "Supabase storage is not configured."}
        try:
            client.storage.from_(SUPABASE_STORAGE_BUCKET).remove([object_path])
            return {"success": True}
        except Exception as exc:
            return {"success": False, "error": str(exc)}
