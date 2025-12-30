export interface StrokeEvent {

    hand: "R" | "L" | "B"; //can only be R L or B
    note_position: number;
    tuplet: number;
    isAccent: boolean;
    isDiddle: boolean;
    isFlam: boolean;
    isBuzz: boolean;
}

export interface PatternSpec {
    tempo: number;
    base_rudiment_sticking: string;
    grid_name: string;
    pattern_length: number;
    beats_per_bar: number;
    subdivision_per_beat: number;
    gridSequence: number[];
    strokes_per_bar: number;
    strokes: StrokeEvent[];
}

export interface GenerateRequest {
    rudiment_name: string;
    grid_name: string;
    tempo: number;
    subdivision_per_beat: number;
    beats_per_bar: number;
    sequence: number[];
    switchHandOnRepeat: boolean;
}

