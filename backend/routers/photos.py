import os
import io
from fastapi import APIRouter, File, UploadFile, HTTPException
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Define the APIRouter instance
router = APIRouter()

SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive'
]
FOLDER_ID = os.getenv('GOOGLE_DRIVE_FOLDER_ID')
CREDS_PATH = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

def get_drive_service():
    """Authenticate and return the Google Drive service."""
    logging.debug(f"CREDS_PATH: {CREDS_PATH}")
    
    if not CREDS_PATH:
        raise ValueError("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.")
    
    if not os.path.exists(CREDS_PATH):
        raise ValueError(f"Credentials file not found at: {CREDS_PATH}")
    
    try:
        creds = service_account.Credentials.from_service_account_file(
            CREDS_PATH, scopes=SCOPES
        )
        service = build('drive', 'v3', credentials=creds)
        logging.debug("Google Drive service created successfully.")
        
        # Log service account email for debugging
        with open(CREDS_PATH, 'r') as f:
            import json
            creds_data = json.load(f)
            logging.info(f"Service account email: {creds_data.get('client_email', 'Not found')}")
        
        return service
    except Exception as e:
        logging.error(f"Failed to create Google Drive service: {e}")
        raise

def verify_folder_access(service):
    """Verify that the service account can access the target folder."""
    try:
        folder = service.files().get(fileId=FOLDER_ID).execute()
        logging.info(f"✓ Folder accessible: '{folder.get('name')}' (ID: {folder.get('id')})")
        return True
    except HttpError as e:
        if e.resp.status == 404:
            logging.error(f"✗ Folder not found: {FOLDER_ID}")
            logging.error("Possible causes:")
            logging.error("1. Folder ID is incorrect")
            logging.error("2. Service account doesn't have access to the folder")
            logging.error("3. Folder was deleted or moved")
        else:
            logging.error(f"✗ HTTP Error accessing folder: {e}")
        return False
    except Exception as e:
        logging.error(f"✗ Unexpected error accessing folder: {e}")
        return False

def list_accessible_files(service, limit=10):
    """List files accessible by the service account for debugging."""
    try:
        results = service.files().list(
            pageSize=limit,
            fields="nextPageToken, files(id, name, parents)"
        ).execute()
        items = results.get('files', [])
        
        logging.info(f"Service account can access {len(items)} files:")
        for item in items:
            logging.info(f"  - {item['name']} (ID: {item['id']}, Parents: {item.get('parents', [])})")
        
        return items
    except Exception as e:
        logging.error(f"Failed to list accessible files: {e}")
        return []

@router.get("/debug/folder-access")
async def debug_folder_access():
    """Debug endpoint to check folder access."""
    if not FOLDER_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_DRIVE_FOLDER_ID environment variable is not set.")
    
    try:
        service = get_drive_service()
        
        # Check folder access
        folder_accessible = verify_folder_access(service)
        
        # List accessible files for debugging
        accessible_files = list_accessible_files(service, 5)
        
        # Additional debugging: try to get folder permissions
        folder_permissions = None
        try:
            permissions = service.permissions().list(fileId=FOLDER_ID).execute()
            folder_permissions = permissions.get('permissions', [])
            logging.info(f"Folder permissions: {folder_permissions}")
        except Exception as perm_error:
            logging.error(f"Cannot get folder permissions: {perm_error}")
        
        # Try to search for any folders we can access
        try:
            search_results = service.files().list(
                q="mimeType='application/vnd.google-apps.folder'",
                pageSize=5,
                fields="files(id, name)"
            ).execute()
            accessible_folders = search_results.get('files', [])
        except Exception as search_error:
            logging.error(f"Cannot search folders: {search_error}")
            accessible_folders = []
        
        return {
            "folder_id": FOLDER_ID,
            "folder_accessible": folder_accessible,
            "accessible_files_count": len(accessible_files),
            "sample_files": [{"name": f["name"], "id": f["id"]} for f in accessible_files[:3]],
            "folder_permissions": folder_permissions,
            "accessible_folders": [{"name": f["name"], "id": f["id"]} for f in accessible_folders],
            "debug_info": {
                "can_list_files": len(accessible_files) > 0,
                "can_search_folders": len(accessible_folders) > 0
            }
        }
    
    except Exception as e:
        logging.error(f"Debug endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Debug error: {str(e)}")

@router.get("/setup-guide")
async def setup_guide():
    """Provide step-by-step setup guide for personal Drive folder."""
    return {
        "problem": "Service accounts cannot store files due to storage quota limits",
        "solution": "Create a folder in your personal Google Drive and share it with the service account",
        "service_account_email": "sabahroadcare@sabahroadcare.iam.gserviceaccount.com",
        "steps": [
            "1. Go to https://drive.google.com (your personal account)",
            "2. Click 'New' → 'Folder'",
            "3. Name it 'Sabah Road Care Uploads'",
            "4. Right-click the folder → 'Share'",
            "5. Add email: sabahroadcare@sabahroadcare.iam.gserviceaccount.com",
            "6. Set permission: Editor",
            "7. Click 'Send'",
            "8. Copy the folder ID from the URL (after /folders/)",
            "9. Update your .env file: GOOGLE_DRIVE_FOLDER_ID=new_folder_id",
            "10. Restart your server"
        ],
        "current_folder_issue": "Current folder is owned by service account - no storage quota",
        "need_personal_drive": True
    }

@router.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file to Google Drive."""
    if not FOLDER_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_DRIVE_FOLDER_ID environment variable is not set.")
    
    logging.info(f"Attempting to upload '{file.filename}' to folder ID: {FOLDER_ID}")
    
    try:
        service = get_drive_service()
        
        # Verify folder access before attempting upload
        if not verify_folder_access(service):
            raise HTTPException(
                status_code=403, 
                detail=f"Cannot access Google Drive folder {FOLDER_ID}. Please check folder permissions."
            )
        
        # Read file content
        file_content = await file.read()
        logging.debug(f"File size: {len(file_content)} bytes")
        
        # Prepare file metadata and media (using simple upload for service accounts)
        file_metadata = {
            'name': file.filename, 
            'parents': [FOLDER_ID]
        }
        media = MediaIoBaseUpload(
            io.BytesIO(file_content), 
            mimetype=file.content_type,
            resumable=False  # Simple upload to avoid quota issues
        )
        
        # Upload file
        uploaded_file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink, webContentLink, name'
        ).execute()
        
        logging.info(f"✓ File uploaded successfully: {uploaded_file.get('name')} (ID: {uploaded_file.get('id')})")
        
        return {
            "success": True,
            "file_id": uploaded_file.get('id'),
            "file_name": uploaded_file.get('name'),
            "webViewLink": uploaded_file.get('webViewLink'),
            "webContentLink": uploaded_file.get('webContentLink')
        }
    
    except HttpError as e:
        error_details = str(e)
        logging.error(f"Google Drive API error: {error_details}")
        
        if "storageQuotaExceeded" in error_details or "Service Accounts do not have storage quota" in error_details:
            raise HTTPException(
                status_code=507, 
                detail="Service account storage issue. Please create a folder in your personal Google Drive and share it with the service account. Use /api/setup-guide for instructions."
            )
        elif "File not found" in error_details:
            raise HTTPException(
                status_code=404, 
                detail=f"Google Drive folder not found or inaccessible: {FOLDER_ID}"
            )
        elif "insufficient permissions" in error_details.lower():
            raise HTTPException(
                status_code=403,
                detail="Service account lacks permissions to access the folder"
            )
        else:
            raise HTTPException(status_code=500, detail=f"Google Drive API error: {error_details}")
    
    except Exception as e:
        logging.error(f"Unexpected error during file upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/create-test-folder")
async def create_test_folder():
    """Create a new test folder that the service account owns."""
    try:
        service = get_drive_service()
        
        # Create a new folder
        folder_metadata = {
            'name': f'Sabah Road Care Uploads {os.urandom(4).hex()}',
            'mimeType': 'application/vnd.google-apps.folder'
        }
        
        folder = service.files().create(body=folder_metadata, fields='id, name, webViewLink').execute()
        
        folder_id = folder.get('id')
        folder_name = folder.get('name')
        folder_link = folder.get('webViewLink')
        
        logging.info(f"Created new folder: {folder_name} (ID: {folder_id})")
        
        # Test access to the new folder immediately
        try:
            test_folder = service.files().get(fileId=folder_id).execute()
            test_access = True
        except:
            test_access = False
        
        return {
            "success": True,
            "folder_id": folder_id,
            "folder_name": folder_name,
            "folder_link": folder_link,
            "test_access": test_access,
            "message": f"New folder created! Update your .env file with: GOOGLE_DRIVE_FOLDER_ID={folder_id}",
            "instructions": [
                "1. Copy the folder_id above",
                "2. Update your .env file: GOOGLE_DRIVE_FOLDER_ID=<folder_id>", 
                "3. Restart your server",
                "4. Test upload again"
            ]
        }
        
    except Exception as e:
        logging.error(f"Failed to create test folder: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create folder: {str(e)}")

@router.get("/create-test-folder-get")
async def create_test_folder_get():
    """Create a new test folder (GET version for easy browser testing)."""
    try:
        service = get_drive_service()
        
        # Create a new folder
        folder_metadata = {
            'name': f'Sabah Road Care Uploads {os.urandom(4).hex()}',
            'mimeType': 'application/vnd.google-apps.folder'
        }
        
        folder = service.files().create(body=folder_metadata, fields='id, name, webViewLink').execute()
        
        folder_id = folder.get('id')
        folder_name = folder.get('name')
        folder_link = folder.get('webViewLink')
        
        logging.info(f"Created new folder: {folder_name} (ID: {folder_id})")
        
        # Test access to the new folder immediately
        try:
            test_folder = service.files().get(fileId=folder_id).execute()
            test_access = True
        except:
            test_access = False
        
        return {
            "success": True,
            "folder_id": folder_id,
            "folder_name": folder_name,
            "folder_link": folder_link,
            "test_access": test_access,
            "message": f"✅ SUCCESS! Copy this folder ID to your .env file:",
            "env_update": f"GOOGLE_DRIVE_FOLDER_ID={folder_id}",
            "instructions": [
                "1. Copy the folder_id above", 
                f"2. Update your .env file: GOOGLE_DRIVE_FOLDER_ID={folder_id}",
                "3. Restart your server (Ctrl+C then start again)",
                "4. Test upload again"
            ]
        }
        
    except Exception as e:
        logging.error(f"Failed to create test folder: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "❌ Failed to create folder. Check your Google Drive API setup."
        }

@router.get("/test-credentials")
async def test_credentials():
    """Test if credentials are properly configured."""
    try:
        service = get_drive_service()
        
        # Test basic API access
        about = service.about().get(fields="user").execute()
        
        return {
            "credentials_valid": True,
            "service_account_email": about.get('user', {}).get('emailAddress', 'Unknown'),
            "folder_id_configured": bool(FOLDER_ID),
            "folder_id": FOLDER_ID
        }
    except Exception as e:
        logging.error(f"Credentials test failed: {e}")
        return {
            "credentials_valid": False,
            "error": str(e),
            "folder_id_configured": bool(FOLDER_ID),
            "folder_id": FOLDER_ID
        }