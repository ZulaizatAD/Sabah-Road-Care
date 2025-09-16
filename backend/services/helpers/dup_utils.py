import math
from geopy.distance import geodesic

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in meters"""
    try:
        return geodesic((lat1, lon1), (lat2, lon2)).meters
    except Exception:
        # Fallback to haversine formula if geopy fails
        R = 6371000  # Earth's radius in meters
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)

        a = (math.sin(delta_lat/2) * math.sin(delta_lat/2) + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * 
             math.sin(delta_lon/2) * math.sin(delta_lon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

def generate_location_hash(latitude: float, longitude: float, precision: int = 4) -> str:
    """Generate a location hash for duplicate detection"""
    return f"{round(latitude, precision)}_{round(longitude, precision)}"
