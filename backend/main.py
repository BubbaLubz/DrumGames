#Rudiment Grid API -- LeetCode for Drummers

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import SessionLocal
import crud, generator

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Rudiment Grid API!"}

# Note: This endpoint is not yet implemented
# @app.post("/create-rudiment/")
# def create_rudiment(rudiment: RudimentCreate):
#     pass

class GenerateRequest(BaseModel):
    rudiment_name: str
    grid_name: str
    tempo: int
    subdivision_per_beat: int
    beats_per_bar: int
    sequence: list[int]
    switchHandOnRepeat: bool

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
        gridSequence = req.sequence,
        switchHandOnRepeat = req.switchHandOnRepeat
    )

class GridRequest(BaseModel):
    beats_per_bar: int
    subdivision_per_beat: int
    number_of_bars: int
    tempo: int = 120

class CustomGridRequest(BaseModel):
    base_sticking: str
    grid_sequence: list[int]
    subdivision_per_beat: int
    beats_per_bar: int
    number_of_bars: int
    tempo: int = 120
    switch_hand_on_repeat: bool = False

@app.post("/generate-custom-grid/")
def generate_custom_grid(req: CustomGridRequest):
    """Generate a grid with custom sticking and sequence using generator.build_grid"""
    from schemas import PatternSpec
    
    # Generate one bar using the generator
    pattern_spec = generator.build_grid(
        tempo=req.tempo,
        base_rudiment_sticking=req.base_sticking,
        grid_name="Custom Grid",
        pattern_length=len(req.base_sticking),
        beats_per_bar=req.beats_per_bar,
        subdivision_per_beat=req.subdivision_per_beat,
        gridSequence=req.grid_sequence,
        switchHandOnRepeat=req.switch_hand_on_repeat
    )
    
    # Debug: Log accent pattern for first bar from generator
    import sys
    strokes_per_bar = pattern_spec.strokes_per_bar
    first_bar_strokes = pattern_spec.strokes[:strokes_per_bar]
    print(f"DEBUG: Grid sequence: {req.grid_sequence}", file=sys.stderr)
    print(f"DEBUG: Beats per bar: {req.beats_per_bar}, Subdivision: {req.subdivision_per_beat}, Strokes per bar: {strokes_per_bar}", file=sys.stderr)
    print(f"DEBUG: First bar accent pattern (from generator): {[s.isAccent for s in first_bar_strokes]}", file=sys.stderr)
    print(f"DEBUG: First bar accent positions (indices): {[i for i, s in enumerate(first_bar_strokes) if s.isAccent]}", file=sys.stderr)
    print(f"DEBUG: First bar accent visual: {''.join(['^' if s.isAccent else '.' for s in first_bar_strokes])}", file=sys.stderr)
    
    # Extend to multiple bars with CONTINUING accent cycle
    all_strokes = []
    strokes_per_bar = pattern_spec.strokes_per_bar
    total_strokes = req.number_of_bars * strokes_per_bar
    
    # First, extend the base pattern (sticking) to all bars
    for bar in range(req.number_of_bars):
        for stroke in pattern_spec.strokes:
            # Adjust note position for each bar
            from schemas import StrokeEvent
            new_stroke = StrokeEvent(
                hand=stroke.hand,
                note_position=round(bar * req.beats_per_bar + stroke.note_position, 3),
                tuplet=stroke.tuplet,
                isAccent=False,  # Will be set by accent logic below
                isDiddle=stroke.isDiddle,
                isFlam=stroke.isFlam,
                isBuzz=stroke.isBuzz
            )
            all_strokes.append(new_stroke)
    
    # Now apply accent pattern across ALL bars using the same logic as generator.py
    # This ensures the accent position continues cycling across bars, not resetting
    beat_index = 0
    accent_pos = 0
    total_beats = total_strokes // req.subdivision_per_beat
    beats_processed = 0
    
    # Use the maximum value in gridSequence as the base (same as generator.py)
    base_value = max(req.grid_sequence)
    
    for nums in req.grid_sequence:
        # Calculate how long one full cycle through all positions takes
        cycle_length = nums * req.subdivision_per_beat
        
        # Calculate section length based on the MAXIMUM value
        base_cycle = base_value * req.subdivision_per_beat
        cycles_needed = base_cycle // cycle_length
        section_length = cycles_needed * cycle_length
        
        section_beats_processed = 0
        
        while section_beats_processed < section_length and beats_processed < total_beats:
            noteGrouping = [False] * req.subdivision_per_beat
            noteGrouping[accent_pos] = True
            
            beats_to_apply = min(nums, section_length - section_beats_processed, total_beats - beats_processed)
            
            for i in range(beats_to_apply):
                beat_start = beat_index * req.subdivision_per_beat
                for j in range(req.subdivision_per_beat):
                    stroke_index = beat_start + j
                    if stroke_index < total_strokes and noteGrouping[j]:
                        all_strokes[stroke_index].isAccent = True
                
                beat_index += 1
                beats_processed += 1
                section_beats_processed += 1
            
            accent_pos = (accent_pos + 1) % req.subdivision_per_beat
        
        accent_pos = 0
    
    # Debug: Show accent pattern for ALL bars
    print(f"DEBUG: === ACCENT PATTERN FOR ALL {req.number_of_bars} BARS ===", file=sys.stderr)
    for bar in range(req.number_of_bars):
        bar_start = bar * strokes_per_bar
        bar_end = bar_start + strokes_per_bar
        bar_strokes = all_strokes[bar_start:bar_end]
        accent_pattern = ''.join(['^' if s.isAccent else '.' for s in bar_strokes])
        accent_positions = [i - bar_start for i in range(bar_start, bar_end) if all_strokes[i].isAccent]
        print(f"DEBUG: Bar {bar + 1}: accents at positions {accent_positions}", file=sys.stderr)
        print(f"DEBUG: Bar {bar + 1} visual: {accent_pattern}", file=sys.stderr)
    print(f"DEBUG: Total strokes: {len(all_strokes)}, Total accents: {sum(1 for s in all_strokes if s.isAccent)}", file=sys.stderr)
    
    return PatternSpec(
        tempo=req.tempo,
        base_rudiment_sticking=req.base_sticking,
        grid_name="Custom Grid",
        pattern_length=len(req.base_sticking),
        beats_per_bar=req.beats_per_bar,
        subdivision_per_beat=req.subdivision_per_beat,
        gridSequence=req.grid_sequence,
        strokes_per_bar=strokes_per_bar,
        strokes=all_strokes
    )

@app.post("/generate-16th-note-grid/")
def generate_16th_note_grid(req: GridRequest):
    """Generate a simple 16th note grid with alternating R/L sticking"""
    from schemas import StrokeEvent, PatternSpec
    
    strokes = []
    tuplet = 1 / req.subdivision_per_beat
    strokes_per_bar = req.beats_per_bar * req.subdivision_per_beat
    total_strokes = req.number_of_bars * strokes_per_bar
    
    for i in range(total_strokes):
        bar = i // strokes_per_bar
        position_in_bar = i % strokes_per_bar
        note_position = bar * req.beats_per_bar + (position_in_bar * tuplet)
        
        # Alternate hands: R, L, R, L...
        hand = "R" if (position_in_bar % 2 == 0) else "L"
        
        # Accent on downbeat of each beat
        is_downbeat = (position_in_bar % req.subdivision_per_beat == 0)
        
        strokes.append(
            StrokeEvent(
                hand=hand,
                note_position=round(note_position, 3),
                tuplet=round(tuplet, 3),
                isAccent=is_downbeat,
                isDiddle=False,
                isFlam=False,
                isBuzz=False
            )
        )
    
    return PatternSpec(
        tempo=req.tempo,
        base_rudiment_sticking="RL",
        grid_name="16th Note Grid",
        pattern_length=2,
        beats_per_bar=req.beats_per_bar,
        subdivision_per_beat=req.subdivision_per_beat,
        gridSequence=[req.beats_per_bar],
        strokes_per_bar=strokes_per_bar,
        strokes=strokes
    )