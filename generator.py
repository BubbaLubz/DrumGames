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
                note_position = round((i * tuplet), 3),
                tuplet = round(tuplet, 3),
                hand = hand,
                isAccent = False,
                isFlam = False,
                isDiddle = False,
                isBuzz = False,
            )
        )
    
    #Accent Sequence
    
    beat_index = 0
    accent_pos = 0
    total_beats = strokes_per_bar // subdivision_per_beat
    beats_processed = 0

    # NEW: Use the maximum value in gridSequence as the base
    base_value = max(gridSequence)  # Gets the largest number (e.g., 4 from [2,1,4])

    for nums in gridSequence:
        # Calculate how long one full cycle through all positions takes
        cycle_length = nums * subdivision_per_beat  # e.g., 2 beats × 4 positions = 8 beats
        
        # Calculate section length based on the MAXIMUM value, not the first
        base_cycle = base_value * subdivision_per_beat  # Always uses max (4 × 4 = 16)
        cycles_needed = base_cycle // cycle_length  # How many cycles to match base length
        section_length = cycles_needed * cycle_length
        
        section_beats_processed = 0
        
        while section_beats_processed < section_length and beats_processed < total_beats:
            noteGrouping = [False] * subdivision_per_beat
            noteGrouping[accent_pos] = True
            
            beats_to_apply = min(nums, section_length - section_beats_processed, total_beats - beats_processed)
            
            for i in range(beats_to_apply):
                beat_start = beat_index * subdivision_per_beat
                for j in range(subdivision_per_beat):
                    stroke_index = beat_start + j
                    if stroke_index < strokes_per_bar and noteGrouping[j]:
                        strokes[stroke_index].isAccent = True
                
                beat_index += 1
                beats_processed += 1
                section_beats_processed += 1
            
            accent_pos = (accent_pos + 1) % subdivision_per_beat
        
        accent_pos = 0

            
            
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
    


    
    



