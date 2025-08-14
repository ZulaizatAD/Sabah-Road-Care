from fastapi import APIRouter, Depends

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/history")
def history(user=Depends(get_current_user)):
    return get_user_history(user)

@router.get("/all-data")
def all_data():
    return get_all_data()