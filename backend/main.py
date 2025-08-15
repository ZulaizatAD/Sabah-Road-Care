from fastapi import FastAPI
from database import engine
import models
from routers import dashboard  

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sabah Road Care API"}