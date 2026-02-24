from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

import models


def haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_earth_m = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_earth_m * c


def query_user_reports(
    db: Session,
    *,
    user_id: int,
    district: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    severity: Optional[str] = None,
):
    query = db.query(models.PotholeReport).filter(models.PotholeReport.user_id == user_id)
    if district:
        query = query.filter(models.PotholeReport.district == district)
    if start_date:
        query = query.filter(models.PotholeReport.date_created >= start_date)
    if end_date:
        query = query.filter(models.PotholeReport.date_created <= end_date)
    if severity:
        query = query.filter(models.PotholeReport.severity == severity)
    return query


def query_nearby_reports(
    db: Session,
    *,
    latitude: float,
    longitude: float,
    radius_m: int,
    hours: int,
    exclude_user_id: Optional[int] = None,
):
    hours_ago = datetime.utcnow() - timedelta(hours=hours)
    lat_delta = radius_m / 111_320
    lon_delta = radius_m / (111_320 * max(math.cos(math.radians(latitude)), 0.1))

    query = db.query(models.PotholeReport).filter(
        models.PotholeReport.latitude >= latitude - lat_delta,
        models.PotholeReport.latitude <= latitude + lat_delta,
        models.PotholeReport.longitude >= longitude - lon_delta,
        models.PotholeReport.longitude <= longitude + lon_delta,
        models.PotholeReport.date_created >= hours_ago,
    )
    if exclude_user_id is None:
        return query
    return query.filter(models.PotholeReport.user_id != exclude_user_id)
