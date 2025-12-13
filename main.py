#Rudiment Grid API -- LeetCode for Drummers

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import crud, musicxmlgenerator

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Rudiment Grid API!"}

@app.post("/create-rudiment/")
def create_rudiment(rudiment: crud.Rudiment):
    return 