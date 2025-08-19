import io, mimetypes, os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
CREDS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

def get_drive_service():
    creds = service_account.Credentials.from_service_account_file(
        CREDS_PATH, scopes=SCOPES
    )
    return build("drive", "v3", credentials=creds, cache_discovery=False)

def upload_bytes_to_drive(data: bytes, filename: str, mimetype: str):
    service = get_drive_service()
    file_metadata = {"name": filename, "parents": [FOLDER_ID]}
    media = MediaIoBaseUpload(io.BytesIO(data), mimetype=mimetype, resumable=True)
    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields="id, webViewLink"
    ).execute()
    return file["id"], file["webViewLink"]

def guess_mime(filename: str, fallback="image/jpeg"):
    return mimetypes.guess_type(filename)[0] or fallback
