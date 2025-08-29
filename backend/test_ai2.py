import asyncio
from services.ai.pothole_analyzer import pothole_analyzer
from database.connect import SessionLocal

async def test_with_real_images():
    """Test with actual image files"""
    
    # Load real image files (put some test images in your project)
    try:
        with open("test_images/pothole_top.jpg", "rb") as f:
            top_image = f.read()
        with open("test_images/pothole_far.jpg", "rb") as f:
            far_image = f.read()
        with open("test_images/pothole_close.jpg", "rb") as f:
            close_image = f.read()
    except FileNotFoundError:
        print("❌ Test images not found. Create test_images/ folder with pothole photos")
        return
    
    db = SessionLocal()
    try:
        result = await pothole_analyzer.analyze_pothole_priority(
            top_image=top_image,
            far_image=far_image,
            close_image=close_image,
            case_id="REAL-TEST-001",
            report_text="Real pothole test",
            latitude=5.9804,
            longitude=116.0735,
            db=db
        )
        
        print("🧪 Real Image Test Results:")
        print(f"   Success: {result['success']}")
        print(f"   Severity: {result['base_severity']}")
        print(f"   Priority: {result['final_priority']}")
        print(f"   Measurements: {result['measurements']}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_with_real_images())