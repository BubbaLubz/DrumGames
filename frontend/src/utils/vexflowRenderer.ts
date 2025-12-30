import { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Articulation, Modifier } from 'vexflow';
import { StrokeEvent } from '../types';

export interface VexFlowConfig {

    containerId: string;
    width?: number;  //notation height, defaults to 1000
    height?: number; //width, defaults to 200
    fontFamily?: string;

}

export function createVexFlowRenderer(config: VexFlowConfig) {

    const { containerId, width = 1000, height = 200, fontFamily = 'Bravura' } = config;
    
    const container = document.getElementById(containerId);
    if (!container) {
        throw new Error(`Container with id "${containerId}" not found`);
    }

    container.innerHTML = '';

    const renderer = new Renderer(container as HTMLDivElement, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    context.setFont(fontFamily, 16, 'normal');

    return { renderer, context };
}

/**
 * Get VexFlow duration string from subdivision count
 */
function getDurationFromSubdivision(subdivision: number): string {
    const durationMap: Record<number, string> = {
        // subdivisionPerBeat -> duration of a single stroke
        // 1 subdivision per beat  -> quarter notes
        1: 'q',   // quarter note
        2: '8',   // eighth notes
        4: '16',  // sixteenth notes
        8: '32',  // thirty‑second notes
    };
    
    return durationMap[subdivision] || '16';
}

/**
 * Convert stroke events to VexFlow notes
 */
export function strokesToVexFlowNotes(
    strokes: StrokeEvent[],
    subdivisionPerBeat: number
): StaveNote[] {
    const duration = getDurationFromSubdivision(subdivisionPerBeat);

    return strokes.map((stroke) => {
        // Each stroke is a single note
        const note = new StaveNote({
            keys: ['c/5'],         // snare line
            duration: duration,    // based on subdivision (e.g. '16')
        });

        // Add accent if needed
        if (stroke.isAccent) {
            const accent = new Articulation('a>');
            accent.setPosition(Modifier.Position.ABOVE);      // place above the note
            accent.setFont({ family: 'Bravura', size: 30 });  // smaller accent glyph
            note.addModifier(accent, 0);
        }

        return note;
    });
}

/**
 * Render a complete pattern to a stave
 */
export function renderPattern(
    strokes: StrokeEvent[],
    beatsPerBar: number,
    subdivisionPerBeat: number,
    config: VexFlowConfig
) {
    const { context } = createVexFlowRenderer(config);

    // Create stave
    const staveWidth = config.width || 1000;
    const stave = new Stave(10, 40, staveWidth);
    stave.addClef('percussion');
    stave.addTimeSignature(`${beatsPerBar}/4`);
    stave.setContext(context).draw();

    // Convert strokes to notes (one note per stroke)
    const notes = strokesToVexFlowNotes(strokes, subdivisionPerBeat);

    // Create beams before drawing to remove individual flags
    // Only beam if we have beamed note durations (8th, 16th, 32nd notes)
    const duration = getDurationFromSubdivision(subdivisionPerBeat);
    const beams: Beam[] = [];
    if (duration !== 'q' && duration !== 'w' && duration !== 'h') {
        // Group notes by beat (subdivisionPerBeat notes per group)
        for (let i = 0; i < notes.length; i += subdivisionPerBeat) {
            const beatNotes = notes.slice(i, i + subdivisionPerBeat);
            // Only create beam if we have 2 or more notes in the group
            if (beatNotes.length >= 2) {
                const beam = new Beam(beatNotes);
                beams.push(beam);
            }
        }
    }

    // Create voice and format
    const voice = new Voice({ numBeats: beatsPerBar, beatValue: 4 });
    voice.addTickables(notes);

    new Formatter().joinVoices([voice]).format([voice], staveWidth);
    voice.draw(context, stave);

    // Draw all beams (this will remove individual flags)
    beams.forEach(beam => beam.setContext(context).draw());
}



