import cloudinary
import cloudinary.uploader
import cloudinary.api
from decouple import config
from typing import Dict, Any

# Configure Cloudinary
cloudinary.config(
    cloud_name=config('CLOUDINARY_CLOUD_NAME'),
    api_key=config('CLOUDINARY_API_KEY'),
    api_secret=config('CLOUDINARY_API_SECRET')
)

class CloudinaryService:
    @staticmethod
    async def upload_profile_image(file_content: bytes, filename: str) -> dict:
        """
        Upload user profile picture to Cloudinary
        """
        try:
            folder_path = "profile_pictures"
            public_id = f"{folder_path}/{filename.split('.')[0]}"
            
            result = cloudinary.uploader.upload(
                file_content,
                public_id=public_id,
                folder=folder_path,
                resource_type="image",
                format="jpg",
                quality="auto",
                fetch_format="auto"
            )
            
            return {
                "success": True,
                "public_id": result["public_id"],
                "secure_url": result["secure_url"]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}


    async def upload_pothole_image(
        file_content: bytes, 
        filename: str, 
        case_id: str,   # 🔄 renamed from report_id
        image_type: str  # 'top_view', 'far', 'close_up'
    ) -> Dict[str, Any]:
        """
        Upload pothole image to Cloudinary
        
        Args:
            file_content: Image file content in bytes
            filename: Original filename
            case_id: Case ID to organize images
            image_type: Type of image (top_view, far, close_up)
            
        Returns:
            Dict containing upload result with public_id and secure_url
        """
        try:
            # Create folder structure: pothole_reports/case_id/
            folder_path = f"pothole_reports/{case_id}"
            
            # Generate public_id with image type
            public_id = f"{folder_path}/{image_type}_{filename.split('.')[0]}"
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file_content,
                public_id=public_id,
                folder=folder_path,
                resource_type="image",
                format="jpg",  # Convert all images to jpg for consistency
                quality="auto",  # Optimize quality
                fetch_format="auto"  # Auto-select best format
            )
            
            return {
                "success": True,
                "public_id": result["public_id"],
                "secure_url": result["secure_url"],
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format"),
                "bytes": result.get("bytes")
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    async def delete_image(public_id: str) -> Dict[str, Any]:
        try:
            result = cloudinary.uploader.destroy(public_id)
            return {
                "success": True,
                "result": result["result"]  # 'ok' if successful
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    async def get_image_urls_for_case(case_id: str) -> Dict[str, str]:
        """
        Get all image URLs for a specific case
        """
        try:
            folder_path = f"pothole_reports/{case_id}"
            result = cloudinary.api.resources(
                type="upload",
                prefix=folder_path,
                max_results=10
            )
            
            image_urls = {}
            for resource in result.get("resources", []):
                public_id = resource["public_id"]
                if "top_view" in public_id:
                    image_urls["top_view"] = resource["secure_url"]
                elif "far" in public_id:
                    image_urls["far"] = resource["secure_url"]
                elif "close_up" in public_id:
                    image_urls["close_up"] = resource["secure_url"]
            
            return image_urls
            
        except Exception as e:
            return {"error": str(e)}
    
    @staticmethod
    def get_optimized_url(public_id: str, width: int = None, height: int = None) -> str:
        transformation = []
        if width:
            transformation.append(f"w_{width}")
        if height:
            transformation.append(f"h_{height}")
        transformation.extend(["c_fill", "f_auto", "q_auto"])
        return cloudinary.CloudinaryImage(public_id).build_url(
            transformation=transformation
        )
