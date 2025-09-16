import os
import base64
import json
from dataclasses import dataclass
from typing import Dict, Optional

from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta  # kept if you log/use later

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage


# =========================
# Config & Globals
# =========================

@dataclass
class SeverityConfig:
    # (Scores kept for logging/telemetry if you want them; not used for severity now)
    w_size_vs_road: float = 0.35
    w_depth_texture: float = 0.35
    w_cracks_edges: float = 0.15
    w_surface_water: float = 0.15

    # Depth thresholds (inches) for final severity:
    #   ≤ 5" -> Low
    #   > 5" and ≤ 10" -> Medium
    #   > 10" -> High
    depth_low_max_in: float = 5.0
    depth_high_min_in: float = 10.0

    # legacy fields retained but unused for severity:
    high_score_threshold: float = 8.4
    medium_score_threshold: float = 6.8
    upward_bias: float = 0.3

CFG = SeverityConfig()

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# =========================
# Core Analyzer
# =========================

class PotholeAnalyzer:
    """
    Analyzes pothole images and sets severity strictly from depth (inches):
        ≤ 5"  => Low
        > 5" to ≤ 10" => Medium
        > 10" => High
    Community metrics and final priority rules remain unchanged.
    """

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",  # Vision-capable model
            temperature=0.0,               # Consistent responses
            api_key=GEMINI_API_KEY
        )

    async def analyze_pothole_priority(
        self,
        top_image: bytes,
        far_image: bytes,
        close_image: bytes,
        case_id: str,
        report_text: Optional[str],
        latitude: float,
        longitude: float,
        db: Session
    ) -> Dict:
        """
        Main function: Analyze pothole images and calculate priority
        """
        try:
            print(f"🔍 Starting AI analysis for case {case_id}")

            # Step 1: Get AI image analysis
            base_analysis = await self._analyze_images_with_ai(
                top_image, far_image, close_image, report_text
            )

            # Step 2: Calculate community engagement
            community_data = self._calculate_community_metrics(
                latitude, longitude, db
            )

            # Step 3: Apply priority rules
            final_priority = self._apply_priority_rules(
                base_analysis, community_data
            )

            # Logging depth in inches for clarity
            depth_in = base_analysis["measurements"]["depth_cm"] / 2.54
            print(f"   Estimated depth: {depth_in:.2f} inches")
            print(f"   Base Severity: {base_analysis['severity']}")
            print(f"   Final Priority: {final_priority['priority']}")
            print(f"   Community: {community_data['similar_reports']} reports")

            return {
                "success": True,
                "base_severity": base_analysis["severity"],
                "final_priority": final_priority["priority"],
                "priority_reason": final_priority["reason"],
                "similar_reports": community_data["similar_reports"],
                "unique_users": community_data["unique_users"],
                "community_multiplier": community_data["multiplier"],
                "measurements": base_analysis["measurements"],
                "confidence": base_analysis["confidence"],
                "analysis_details": {
                    "base_analysis": base_analysis,
                    "community_data": community_data,
                    "priority_calculation": final_priority
                }
            }

        except Exception as e:
            print(f"❌ AI analysis failed for {case_id}: {str(e)}")
            return self._get_fallback_response()

    # ---------- Step 1: AI Image Analysis ----------

    async def _analyze_images_with_ai(
        self,
        top_image: bytes,
        far_image: bytes,
        close_image: bytes,
        report_text: Optional[str]
    ) -> Dict:
        """
        Send images to Gemini AI for analysis and parse response.
        """
        try:
            images_b64 = {
                "top": base64.b64encode(top_image).decode("utf-8"),
                "far": base64.b64encode(far_image).decode("utf-8"),
                "close": base64.b64encode(close_image).decode("utf-8"),
            }

            prompt = self._create_analysis_prompt(report_text)
            ai_response = await self._call_gemini_vision(prompt, images_b64)

            return self._parse_ai_response(ai_response)

        except Exception as e:
            print(f"Image analysis failed: {str(e)}")
            return self._get_default_analysis()

    def _create_analysis_prompt(self, report_text: Optional[str]) -> str:
        """
        Prompt for Gemini Vision. We will OVERRIDE severity locally using depth-only rule.
        """
        prompt = """
TASK: Analyze pothole damage from road images and return JSON.

You will receive 3 images: top-view, far-view, and close-up of a pothole.

ANALYSIS CRITERIA (for context/logging only):
1. Size vs road width (score 1-10)
2. Depth & texture contrast (score 1-10)
3. Cracks & edge quality (score 1-10)
4. Surface condition & water pooling (score 1-10)

RETURN ONLY THIS JSON FORMAT:
{
    "scores": {
        "size_vs_road_width": <1-10>,
        "depth_texture": <1-10>,
        "cracks_edges": <1-10>,
        "surface_water": <1-10>
    },
    "severity": "<Low|Medium|High>",   // You may estimate, but it will be overridden by depth rules
    "measurements": {
        "length_cm": <estimated_length>,
        "width_cm": <estimated_width>,
        "depth_cm": <estimated_depth>
    },
    "confidence": <0.0-1.0>,
    "observations": {
        "size_analysis": "<brief_description>",
        "depth_analysis": "<brief_description>",
        "surface_analysis": "<brief_description>"
    }
}

SEVERITY NOTE: Final severity will be computed strictly by depth in inches on our side.

Return ONLY the JSON, no other text.

CONTEXT: This is a road in Sabah, Malaysia.
"""
        if report_text:
            prompt += f"\n\nUSER REPORT: {report_text}"
        return prompt

    async def _call_gemini_vision(self, prompt: str, images_b64: Dict) -> str:
        """
        Send request to Gemini Vision API
        """
        message_content = [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{images_b64['top']}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{images_b64['far']}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{images_b64['close']}"}},
        ]
        response = await self.llm.ainvoke([HumanMessage(content=message_content)])
        return response.content.strip()

    def _parse_ai_response(self, ai_response: str) -> Dict:
        """
        Parse and validate JSON. OVERRIDES severity using depth-only inches rule.
        """
        try:
            cleaned = ai_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:-3].strip()
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:-3].strip()

            data = json.loads(cleaned)

            # Scores (kept for logs)
            scores = data.get("scores", {})
            for key in ["size_vs_road_width", "depth_texture", "cracks_edges", "surface_water"]:
                val = scores.get(key, 5)
                if not isinstance(val, (int, float)):
                    val = 5
                scores[key] = max(1, min(10, float(val)))

            # Measurements (cm)
            measurements = data.get("measurements", {})
            for key in ["length_cm", "width_cm", "depth_cm"]:
                val = measurements.get(key, 0.0)
                try:
                    val = float(val)
                except (TypeError, ValueError):
                    val = 0.0
                measurements[key] = max(0.0, val)

            # Confidence
            confidence = data.get("confidence", 0.5)
            if not isinstance(confidence, (int, float)) or not (0.0 <= float(confidence) <= 1.0):
                confidence = 0.5
            confidence = float(confidence)

            # FINAL SEVERITY (depth-only, in inches)
            severity = self._severity_from_depth_inches(measurements)

            return {
                "severity": severity,
                "confidence": confidence,
                "scores": scores,
                "measurements": measurements,
                "observations": data.get("observations", {})
            }

        except (json.JSONDecodeError, ValueError) as e:
            print(f"JSON parsing error: {e}")
            print(f"AI Response: {ai_response}")
            return self._get_default_analysis()

    def _severity_from_depth_inches(self, measurements: Dict) -> str:
        """
        Final severity rule (depth only):
          - ≤ 5 inches  => Low
          - > 5 to ≤ 10 => Medium
          - > 10        => High
        """
        depth_cm = float(measurements.get("depth_cm", 0) or 0)
        depth_in = depth_cm / 2.54

        if depth_in > CFG.depth_high_min_in:
            return "High"
        if depth_in > CFG.depth_low_max_in:
            return "Medium"
        return "Low"

    # ---------- Step 2: Community Metrics ----------

    def _calculate_community_metrics(self, latitude: float, longitude: float, db: Session) -> Dict:
        """
        Calculate community engagement metrics around (lat,lng).
        """
        try:
            lat_range = 0.0005  # ~50m
            lng_range = 0.0005

            # Local import to avoid circulars; ensure models.PotholeReport exists
            import models

            similar_reports = db.query(models.PotholeReport).filter(
                models.PotholeReport.latitude.between(latitude - lat_range, latitude + lat_range),
                models.PotholeReport.longitude.between(longitude - lng_range, longitude + lng_range),
            ).count()

            unique_users = db.query(
                func.count(func.distinct(models.PotholeReport.user_id))
            ).filter(
                models.PotholeReport.latitude.between(latitude - lat_range, latitude + lat_range),
                models.PotholeReport.longitude.between(longitude - lng_range, longitude + lng_range),
            ).scalar() or 0

            if similar_reports >= 8 and unique_users >= 5:
                multiplier = 3.0
            elif similar_reports >= 5 and unique_users >= 3:
                multiplier = 2.0
            elif similar_reports >= 2:
                multiplier = 1.5
            else:
                multiplier = 1.0

            return {
                "similar_reports": similar_reports,
                "unique_users": unique_users,
                "multiplier": multiplier,
            }

        except Exception as e:
            print(f"Community analysis failed: {str(e)}")
            return {
                "similar_reports": 1,
                "unique_users": 1,
                "multiplier": 1.0
            }

    # ---------- Step 3: Priority Rules ----------

    def _apply_priority_rules(self, base_analysis: Dict, community_data: Dict) -> Dict:
        """
        Combine base severity with community signals for a final priority class.
        """
        similar_reports = community_data["similar_reports"]
        unique_users = community_data["unique_users"]
        base_severity = base_analysis["severity"]

        if similar_reports >= 8 and unique_users >= 5:
            priority = "High"
            reason = f"High community impact: {similar_reports} reports from {unique_users} users"
        elif similar_reports >= 5 and unique_users >= 3:
            priority = "Medium"
            reason = f"Moderate community impact: {similar_reports} reports from {unique_users} users"
        elif similar_reports == 1:
            priority = base_severity
            reason = f"Single report - using base severity: {base_severity}"
        else:
            priority = base_severity
            reason = f"Multiple reports ({similar_reports}) - using base severity: {base_severity}"

        return {"priority": priority, "reason": reason}

    # ---------- Fallbacks ----------

    def _get_default_analysis(self) -> Dict:
        """
        Fallback analysis when AI fails
        """
        default_measurements = {"length_cm": 20.0, "width_cm": 15.0, "depth_cm": 0.0}
        return {
            "severity": self._severity_from_depth_inches(default_measurements),
            "confidence": 0.3,
            "scores": {
                "size_vs_road_width": 5,
                "depth_texture": 5,
                "cracks_edges": 5,
                "surface_water": 5
            },
            "measurements": default_measurements,
            "observations": {
                "size_analysis": "Unable to analyze - using defaults",
                "depth_analysis": "Unable to analyze - using defaults",
                "surface_analysis": "Unable to analyze - using defaults"
            }
        }

    def _get_fallback_response(self) -> Dict:
        """
        Complete fallback when everything fails
        """
        return {
            "success": False,
            "base_severity": "Low",            # depth defaults to 0" => Low
            "final_priority": "Low",
            "priority_reason": "AI analysis failed - using default values",
            "similar_reports": 1,
            "unique_users": 1,
            "community_multiplier": 1.0,
            "measurements": {"length_cm": 20.0, "width_cm": 15.0, "depth_cm": 0.0},
            "confidence": 0.0,
            "analysis_details": {}
        }


# =========================
# Singleton instance
# =========================

pothole_analyzer = PotholeAnalyzer()
