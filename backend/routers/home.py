from fastapi import APIRouter

router = APIRouter(prefix="/homepage", tags=["Homepage"])

@router.post("/submit-form")
def submit_form(data: FormData):
    save_form_data(data)
    return {"message": "Form submitted successfully"}