import asyncio
from services.ai.pothole_analyzer import pothole_analyzer
from database.connect import SessionLocal

async def test_ai_basic():
    """Test AI service basic functionality"""
    
    # Create tiny test images (1 byte each)
    test_image = b'\x00'  # Simple byte data
    
    db = SessionLocal()
    try:
        result = await pothole_analyzer.analyze_pothole_priority(
            top_image=test_image,
            far_image=test_image,
            close_image=test_image,
            case_id="TEST-001",
            report_text="Test pothole",
            latitude=5.9804,  # Kota Kinabalu coordinates
            longitude=116.0735,
            db=db
        )
        
        print("🧪 Test Results:")
        print(f"   Success: {result['success']}")
        print(f"   Severity: {result['base_severity']}")
        print(f"   Priority: {result['final_priority']}")
        print(f"   Confidence: {result['confidence']}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_ai_basic())