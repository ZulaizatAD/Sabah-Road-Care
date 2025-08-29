import os
import base64
from typing import Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage
from dotenv import load_dotenv
import json
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class PotholeAnalyzer:
    def __init__(self):
        # Initialize Gemini AI for image analysis
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",  # Vision-capable model
            temperature=0.0,  # Consistent responses
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
            
            print(f"✅ AI analysis completed for {case_id}")
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
    
    async def _analyze_images_with_ai(
        self, 
        top_image: bytes, 
        far_image: bytes, 
        close_image: bytes,
        report_text: Optional[str]
    ) -> Dict:
        """
        Step 1: Send images to Gemini AI for analysis
        """
        try:
            # Convert images to base64 for Gemini
            images_b64 = {
                "top": base64.b64encode(top_image).decode('utf-8'),
                "far": base64.b64encode(far_image).decode('utf-8'),
                "close": base64.b64encode(close_image).decode('utf-8')
            }
            
            # Create analysis prompt
            prompt = self._create_analysis_prompt(report_text)
            
            # Send to Gemini AI
            ai_response = await self._call_gemini_vision(prompt, images_b64)
            
            # Parse and validate response
            return self._parse_ai_response(ai_response)
            
        except Exception as e:
            print(f"Image analysis failed: {str(e)}")
            return self._get_default_analysis()
    
    def _create_analysis_prompt(self, report_text: Optional[str]) -> str:
        """
        Create prompt for Gemini AI analysis
        """
        prompt = """
        TASK: Analyze pothole damage from road images and return JSON.

        You will receive 3 images: top-view, far-view, and close-up of a pothole.

        ANALYSIS CRITERIA:
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
            "severity": "<Low|Medium|High>",
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

        SEVERITY RULES:
        - High: Average score ≥ 9.0 OR safety hazard
        - Medium: Average score 7.0-8.9
        - Low: Average score < 7.0

        Return ONLY the JSON, no other text.

        CONTEXT: This is a road in Sabah, Malaysia.
        Consider local road conditions and standards.
        Be conservative with severity assessment.
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
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{images_b64['close']}"}}
        ]
        
        response = await self.llm.ainvoke([HumanMessage(content=message_content)])
        return response.content.strip()
    
    def _parse_ai_response(self, ai_response: str) -> Dict:
        """
        Parse and validate AI JSON response
        """
        try:
            # Clean response (remove markdown if present)
            cleaned = ai_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:-3].strip()
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:-3].strip()
            
            # Parse JSON
            data = json.loads(cleaned)
            
            # Validate and clean data
            scores = data.get("scores", {})
            for key in ["size_vs_road_width", "depth_texture", "cracks_edges", "surface_water"]:
                if key not in scores or not isinstance(scores[key], (int, float)):
                    scores[key] = 5  # Default score
                scores[key] = max(1, min(10, scores[key]))  # Clamp to 1-10
            
            # Validate severity
            severity = data.get("severity", "Medium")
            if severity not in ["Low", "Medium", "High"]:
                severity = "Medium"
            
            # Validate confidence
            confidence = data.get("confidence", 0.5)
            if not isinstance(confidence, (int, float)) or not (0 <= confidence <= 1):
                confidence = 0.5
            
            # Validate measurements
            measurements = data.get("measurements", {})
            for key in ["length_cm", "width_cm", "depth_cm"]:
                if key not in measurements:
                    measurements[key] = 20  # Default size
                measurements[key] = max(1, measurements[key])  # Positive values only
            
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
    
    def _calculate_community_metrics(self, latitude: float, longitude: float, db: Session) -> Dict:
        """
        Step 2: Calculate community engagement metrics
        """
        try:
            # Define search radius (approximately 50 meters)
            lat_range = 0.0005
            lng_range = 0.0005
            
            # Import here to avoid circular imports
            import models
            
            # Count similar reports in area
            similar_reports = db.query(models.PotholeReport).filter(
                models.PotholeReport.latitude.between(
                    latitude - lat_range, latitude + lat_range
                ),
                models.PotholeReport.longitude.between(
                    longitude - lng_range, longitude + lng_range
                )
            ).count()
            
            # Count unique users in area
            unique_users = db.query(
                func.count(func.distinct(models.PotholeReport.user_id))
            ).filter(
                models.PotholeReport.latitude.between(
                    latitude - lat_range, latitude + lat_range
                ),
                models.PotholeReport.longitude.between(
                    longitude - lng_range, longitude + lng_range
                )
            ).scalar() or 0
            
            # Calculate community multiplier
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
                "multiplier": multiplier
            }
            
        except Exception as e:
            print(f"Community analysis failed: {str(e)}")
            return {
                "similar_reports": 1,
                "unique_users": 1,
                "multiplier": 1.0
            }
    
    def _apply_priority_rules(self, base_analysis: Dict, community_data: Dict) -> Dict:
        """
        Step 3: Apply your priority classification rules
        """
        similar_reports = community_data["similar_reports"]
        unique_users = community_data["unique_users"]
        base_severity = base_analysis["severity"]
        
        # Apply your specific priority rules
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
        
        return {
            "priority": priority,
            "reason": reason
        }
    
    def _get_default_analysis(self) -> Dict:
        """
        Fallback analysis when AI fails
        """
        return {
            "severity": "Medium",
            "confidence": 0.3,
            "scores": {
                "size_vs_road_width": 5,
                "depth_texture": 5,
                "cracks_edges": 5,
                "surface_water": 5
            },
            "measurements": {
                "length_cm": 20,
                "width_cm": 15,
                "depth_cm": 3
            },
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
            "base_severity": "Medium",
            "final_priority": "Medium",
            "priority_reason": "AI analysis failed - using default values",
            "similar_reports": 1,
            "unique_users": 1,
            "community_multiplier": 1.0,
            "measurements": {"length_cm": 20, "width_cm": 15, "depth_cm": 3},
            "confidence": 0.0,
            "analysis_details": {}
        }

# Create singleton instance
pothole_analyzer = PotholeAnalyzer()