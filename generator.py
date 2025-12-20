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
    
    # HOW MODULO WORKS TO MOVE ACCENT ACROSS A GROUPING OF 4:
    # 
    # If you have a group of 4 positions: [0, 1, 2, 3]
    # Using `i % 4` cycles through: 0, 1, 2, 3, 0, 1, 2, 3, ...
    #
    # Example with stroke index i:
    #   i=0:  0 % 4 = 0  (position 0 in group)
    #   i=1:  1 % 4 = 1  (position 1 in group)
    #   i=2:  2 % 4 = 2  (position 2 in group)
    #   i=3:  3 % 4 = 3  (position 3 in group)
    #   i=4:  4 % 4 = 0  (back to position 0 - new group starts)
    #   i=5:  5 % 4 = 1  (position 1 in new group)
    #
    # To move accent position within the group:
    #   accent_pos = 0  # Start accenting position 0
    #   if (i % 4) == accent_pos:  # Accent this stroke
    #
    # After repeating enough times, shift accent:
    #   accent_pos = (accent_pos + 1) % 4  # Moves: 0->1->2->3->0

    beat_index = 0  # Track which beat we're on
    accent_pos = 0

    # Calculate total beats we need to fill
    total_beats = strokes_per_bar // subdivision_per_beat

    beats_processed = 0

    for nums in gridSequence:  # nums = how many beats to accent this position
        while beats_processed < total_beats:
            # Create accent pattern for this displacement
            noteGrouping = [False] * subdivision_per_beat
            noteGrouping[accent_pos] = True  # Accent only this position
            
            # Apply this pattern for 'nums' beats (or remaining beats)
            beats_to_apply = min(nums, total_beats - beats_processed)
            
            for i in range(beats_to_apply):
                # Apply pattern to this beat's strokes
                beat_start = beat_index * subdivision_per_beat
                for j in range(subdivision_per_beat):
                    stroke_index = beat_start + j
                    if stroke_index < strokes_per_bar and noteGrouping[j]:
                        strokes[stroke_index].isAccent = True
                
                beat_index += 1
                beats_processed += 1
            
            # Move accent to next position in the grouping
            accent_pos = (accent_pos + 1) % subdivision_per_beat
            
            # If we've filled all beats, exit
            if beats_processed >= total_beats:
                break

            
            
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
    


    
    



