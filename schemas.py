from pydantic import BaseModel
from typing import List, Optional, Literal

class StrokeEvent(BaseModel):
    hand: Literal["R", "L", "B"]  #Either Right, Left, or Both Hands
    note_position: float
    tuplet: float
    isAccent: bool
    isDiddle: bool
    isFlam: bool
    isBuzz: bool

class AccentPattern(BaseModel):
    pass

class GridSpec(BaseModel):
    beats_per_bar: int
    subdivision_per_beat: int

class PatternSpec(BaseModel):
    tempo: int
    base_rudiment_sticking: str
    grid_name: str
    pattern_length: int
    beats_per_bar: int
    subdivision_per_beat: int
    gridSequence: list[int]  #Includes sequences like 4-2-1, 4-2, 4, etc...
    strokes_per_bar: int
    strokes: list[StrokeEvent]

class GridFormat(BaseModel):
    name: str
    baseRudiment: int
    sequence: List
    beats_per_bar: int  
    subdivision_per_beat: int  #Determines tuplet (triplet, 16th, fivelet, etc..)

