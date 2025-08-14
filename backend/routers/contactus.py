from fastapi import APIRouter

router = APIRouter(prefix="/contact", tags=["Contact Us"])

@router.post("/send")
def send_message(data: ContactForm):
    save_contact_message(data)
    return {"message": "Message received. We'll get back to you soon."}