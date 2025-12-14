#Rudiment Grid API -- LeetCode for Drummers

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import SessionLocal
import crud, generator

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Rudiment Grid API!"}

@app.post("/create-rudiment/")
def create_rudiment(rudiment: crud.Rudiment):
    return 

class GenerateRequest(BaseModel):
    rudiment_name: str
    grid_name: str
    tempo: int
    subdivision_per_beat: int
    beats_per_bar: int
    sequence: list[int]

@app.post("/getBaseRudiment/")
def generate_from_rudiment(req: GenerateRequest):
    with SessionLocal() as session:
        rud = crud.get_rudiment_by_name(session, req.rudiment_name)
    if not rud:
        raise HTTPException(404, "Rudiment not found.")
    
    return generator.build_grid(
        tempo = req.tempo,
        base_rudiment_sticking = rud.sticking,
        grid_name = req.grid_name,
        pattern_length = rud.pattern_length,
        beats_per_bar = req.beats_per_bar,
        subdivision_per_beat = req.subdivision_per_beat,
        gridSequence = req.sequence
    )
