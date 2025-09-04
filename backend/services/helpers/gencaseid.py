from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
import models

# Sabah has 27 districts
DISTRICTS = [
    "Beaufort", "Beluran", "Keningau", "Kinabatangan", "Kota Belud",
    "Kota Kinabalu", "Kota Marudu", "Kuala Penyu", "Kudat", "Kunak",
    "Lahad Datu", "Nabawan", "Papar", "Penampang", "Pitas",
    "Putatan", "Ranau", "Sandakan", "Semporna", "Sipitang",
    "Tambunan", "Tawau", "Tenom", "Tongod", "Tuaran", "Telupid"
]


def gen_case_id(district: str, db: Session) -> str:
    """Generate case ID like SRC_BEA_2025_09_0001"""

    if district not in DISTRICTS:
        raise HTTPException(status_code=400, detail=f"Invalid district: {district}")

    # District → 3-letter code
    district_code = district.replace(" ", "")[:3].upper()

    # Current year/month
    now = datetime.utcnow()
    year = now.strftime("%Y")
    month = now.strftime("%m")

    # Count reports for this district in this month
    prefix = f"SRC_{district_code}_{year}_{month}"
    count = (
        db.query(models.PotholeReport)
        .filter(models.PotholeReport.case_id.like(f"{prefix}_%"))
        .count()
    )

    # Next sequence number (zero-padded to 4 digits)
    sequence = str(count + 1).zfill(4)

    return f"{prefix}_{sequence}"
