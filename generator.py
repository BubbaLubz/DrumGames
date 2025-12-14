from typing import List, Dict, Optional
from schemas import PatternSpec, StrokeEvent


def build_grid(
    tempo: int, 
    base_rudiment_sticking: str, 
    grid_name: str, 
    pattern_length: int, 
    beats_per_bar: int, 
    subdivision_per_beat: int, 
    gridSequence: list[int]
    ):
    
    for repetitionNums in gridSequence:
        if not isinstance(repetitionNums, int):
            raise TypeError(f"List must contain only integers, but found type {type(repetitionNums).__name__}")
    
    
    pass


