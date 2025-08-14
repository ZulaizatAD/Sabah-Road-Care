# login singup update delete

from fastapi import APIRouter

router = APIRouter(
    prefix="/account",
    tags=["account"],
    responses={404: {"description": "Not found"}},
)

@router.post("/signup")
def signup(data: SignUpData):
    return signup_user(data)

@router.post("/login")
def login(data: LoginData):
    return login_user(data)

@router.put("/profile")
def update(data: UpdateProfileData):
    return update_profile(data)

@router.delete("/delete")
def delete():
    return delete_account()