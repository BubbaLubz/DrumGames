from typing import List, Dict, Optional
from schemas import PatternSpec, StrokeEvent

default_tempo = 120

def build_grid(
    tempo: int, 
    base_rudiment_sticking: str, 
    grid_name: str, 
    pattern_length: int, 
    beats_per_bar: int, 
    subdivision_per_beat: int, 
    gridSequence: list[int],
    switchHandOnRepeat: bool = False
    ) -> PatternSpec:


    tuplet = 1 / subdivision_per_beat  #E.g., 1/3 for triplets, 1/5 for quintuplets, etc...
    strokes_per_bar = beats_per_bar * subdivision_per_beat
    strokes = []
    
#Generate sticking + invert sticking if rudiment requires
    
    handSwap = {"R": "L", "L" : "R", "B": "B"}  #Sticking inversion for rudiments.
    len_stick = len(base_rudiment_sticking)
    inverted = []

    for ch in base_rudiment_sticking:
        inverted.append(handSwap[ch])  #Swaps R and L, keeps B
    inverted_sticking = "".join(inverted) 

    for i in range(strokes_per_bar):
        rep = i // len_stick
        pattern = inverted_sticking if (switchHandOnRepeat and rep % 2 == 1) else base_rudiment_sticking
        hand = pattern[i % len_stick]
        strokes.append(
            StrokeEvent(
                note_position = (i * tuplet),
                tuplet = tuplet,
                hand = hand,
                isAccent = False,
                isFlam = False,
                isDiddle = False,
                isBuzz = False,
            )
        )
    
    #Accent Sequence

    for repetitionNums in gridSequence:  
        if not isinstance(repetitionNums, int):
            raise TypeError(f"List must contain only integers, but found type {type(repetitionNums).__name__}")  
        


    #Check the list of repetitions - go through each number and repeat that accent pattern grouping until it reaches the number - only then, move on.
    
    noteGrouping = [True, False, False, False]
    noteOverlay = len(noteGrouping)
    convertedSequence = [item * subdivision_per_beat for item in gridSequence]

    for nums in range(noteOverlay):
        pass

            
    return PatternSpec(
        tempo = tempo,
        base_rudiment_sticking = base_rudiment_sticking,
        grid_name = grid_name,
        pattern_length = pattern_length,
        beats_per_bar = beats_per_bar,
        subdivision_per_beat = subdivision_per_beat,
        gridSequence = gridSequence,
        strokes_per_bar = strokes_per_bar,
        strokes = strokes,
    )
    

    
    



