import { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Articulation, Modifier, BarNote, Annotation, Tuplet } from 'vexflow';
import { StrokeEvent } from '../types';

export interface VexFlowConfig {

    containerId: string;
    width?: number;  //notation height, defaults to 1000
    height?: number; //width, defaults to 200
    fontFamily?: string;
    maxNotesPerStave?: number; // Maximum notes per stave before creating a new line, defaults to 32
    noteSpacing?: number; // Spacing multiplier for notes (1.0 = default, < 1.0 = tighter, > 1.0 = wider), defaults to 1.0

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
 * For tuplets (3, 5, 6, 7, etc.), we use the base duration that would fit
 */
function getDurationFromSubdivision(subdivision: number): string {
    const durationMap: Record<number, string> = {
        // subdivisionPerBeat -> duration of a single stroke
        // 1 subdivision per beat  -> quarter notes
        1: 'q',   // quarter note
        2: '8',   // eighth notes
        3: '8',   // triplets (8th note duration, grouped in 3s)
        4: '16',  // sixteenth notes
        5: '16',  // quintuplets (16th note duration, grouped in 5s)
        6: '16',  // sextuplets (16th note duration, grouped in 6s)
        7: '16',  // septuplets (16th note duration, grouped in 7s)
        8: '32',  // thirty‑second notes
    };
    
    // For other subdivisions, use the closest power of 2
    if (durationMap[subdivision]) {
        return durationMap[subdivision];
    }
    
    // Default to 16th notes for unknown subdivisions
    return '16';
}

/**
 * Check if a subdivision requires tuplet notation
 */
function requiresTuplet(subdivision: number): boolean {
    // Tuplets are needed for non-power-of-2 subdivisions (except 1)
    return subdivision !== 1 && subdivision !== 2 && subdivision !== 4 && subdivision !== 8 && subdivision !== 16 && subdivision !== 32;
}

/**
 * Get tuplet ratio for a given subdivision
 * Returns [notesPlayed, notesInSpace] e.g., [3, 2] for triplets
 */
function getTupletRatio(subdivision: number): [number, number] | null {
    if (!requiresTuplet(subdivision)) {
        return null;
    }
    
    // Common tuplet ratios
    const tupletRatios: Record<number, [number, number]> = {
        3: [3, 2],   // triplets: 3 notes in space of 2
        5: [5, 4],   // quintuplets: 5 notes in space of 4
        6: [6, 4],   // sextuplets: 6 notes in space of 4 (or 3:2)
        7: [7, 4],   // septuplets: 7 notes in space of 4
        9: [9, 8],   // nonuplets: 9 notes in space of 8
    };
    
    if (tupletRatios[subdivision]) {
        return tupletRatios[subdivision];
    }
    
    // Default: use the next lower power of 2 as the space
    if (subdivision < 4) {
        return [subdivision, 2]; // e.g., 3:2
    } else if (subdivision < 8) {
        return [subdivision, 4]; // e.g., 5:4, 6:4, 7:4
    } else {
        return [subdivision, 8]; // e.g., 9:8
    }
}

/**
 * Convert stroke events to VexFlow notes
 */
export function strokesToVexFlowNotes(
    strokes: StrokeEvent[],
    subdivisionPerBeat: number
): StaveNote[] {
    const duration = getDurationFromSubdivision(subdivisionPerBeat);

    return strokes.map((stroke, index) => {
        // Each stroke is a single note
        const note = new StaveNote({
            keys: ['c/5'],         // snare line
            duration: duration,    // based on subdivision (e.g. '16')
        });

        // Add accent if needed - the accent flag comes from generator.py logic
        // Accents are applied based on gridSequence following generator.py accent pattern
        if (stroke.isAccent === true) {
            const accent = new Articulation('a>');
            accent.setPosition(Modifier.Position.ABOVE);      // place above the note
            accent.setFont({ family: 'Bravura', size: 30 });  // smaller accent glyph
            note.addModifier(accent, 0);
        }

        // Add hand annotation (R, L, or B) below the note
        if (stroke.hand) {
            const handAnnotation = new Annotation(stroke.hand);
            handAnnotation.setFont('Arial', 12, 'bold');
            handAnnotation.setVerticalJustification(Annotation.VerticalJustify.BOTTOM);
            handAnnotation.setPosition(Modifier.Position.BELOW);
            note.addModifier(handAnnotation, 0);
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
    // Convert strokes to notes (one note per stroke)
    const allNotes = strokesToVexFlowNotes(strokes, subdivisionPerBeat);

    // Calculate number of bars needed
    const notesPerBar = beatsPerBar * subdivisionPerBeat;
    const maxNotesPerStave = config.maxNotesPerStave || 32;
    
    // Group notes into bars
    const bars: StaveNote[][] = [];
    for (let i = 0; i < allNotes.length; i += notesPerBar) {
        bars.push(allNotes.slice(i, i + notesPerBar));
    }

    // Initial grouping: Group bars into staves based on note limit
    const initialStaves: (StaveNote | BarNote)[][] = [];
    let currentStaveNotes: (StaveNote | BarNote)[] = [];
    let currentStaveNoteCount = 0;

    for (let barIdx = 0; barIdx < bars.length; barIdx++) {
        const barNotes = bars[barIdx];
        
        // Check if adding this bar would exceed the limit
        if (currentStaveNoteCount + barNotes.length > maxNotesPerStave && currentStaveNotes.length > 0) {
            // Start a new stave
            initialStaves.push(currentStaveNotes);
            currentStaveNotes = [];
            currentStaveNoteCount = 0;
        }
        
        // Add notes from this bar
        currentStaveNotes.push(...barNotes);
        currentStaveNoteCount += barNotes.length;
        
        // Add a barline after this bar (except for the last bar)
        if (barIdx < bars.length - 1) {
            // Check if the next bar would fit on this stave
            const nextBarNotes = bars[barIdx + 1];
            const wouldExceedLimit = currentStaveNoteCount + nextBarNotes.length > maxNotesPerStave;
            
            // Only add barline if next bar is on the same stave
            if (!wouldExceedLimit) {
                currentStaveNotes.push(new BarNote());
            }
        }
    }
    
    // Add the last stave if it has notes
    if (currentStaveNotes.length > 0) {
        initialStaves.push(currentStaveNotes);
    }

    // Get container width to prevent horizontal scrolling
    const container = document.getElementById(config.containerId);
    let containerWidth = config.width || 1000;
    
    if (container) {
        // Use container's actual width, or parent width, or viewport width
        const rect = container.getBoundingClientRect();
        if (rect.width > 0) {
            containerWidth = rect.width;
        } else {
            // Fallback: use parent or viewport width
            const parent = container.parentElement;
            if (parent) {
                const parentRect = parent.getBoundingClientRect();
                containerWidth = parentRect.width > 0 ? parentRect.width : window.innerWidth - 40;
            } else {
                containerWidth = window.innerWidth - 40; // Account for padding
            }
        }
    }
    
    // Limit stave width to container width to prevent horizontal scrolling
    const staveWidth = Math.min(containerWidth - 20, config.width || containerWidth); // -20 for padding
    // Increase stave height when tuplets are used to provide more space for brackets and sticking annotations
    const hasTuplets = requiresTuplet(subdivisionPerBeat);
    const staveHeight = hasTuplets ? 120 : 100; // Extra height for tuplets to prevent bracket/annotation overlap
    const staveSpacing = 20; // Space between staves
    const startY = 40;
    
    // Calculate total height needed for all staves
    const totalHeight = startY + (initialStaves.length * (staveHeight + staveSpacing));
    
    // Create renderer with calculated height and container width
    const { renderer, context } = createVexFlowRenderer({
        ...config,
        width: containerWidth, // Use container width to prevent scrolling
        height: totalHeight
    });

    // Create beams before drawing to remove individual flags
    // Only beam if we have beamed note durations (8th, 16th, 32nd notes)
    const duration = getDurationFromSubdivision(subdivisionPerBeat);
    
    // Reorganize staves with automatic spacing adjustment
    const edgeThreshold = 50; // Pixels from edge before breaking to new stave
    const minSpacing = 0.3; // Minimum spacing multiplier to keep notes readable
    const maxSpacing = 1.5; // Maximum spacing multiplier
    const baseSpacing = config.noteSpacing || 1.0;
    const reorganizedStaves: (StaveNote | BarNote)[][] = [];
    const staveSpacings: number[] = []; // Store optimal spacing for each stave
    
    // First pass: Format each stave and optimize spacing or break if needed
    for (let staveIndex = 0; staveIndex < initialStaves.length; staveIndex++) {
        const staveNotes = initialStaves[staveIndex];
        if (staveNotes.length === 0) continue;

        const staveY = startY + (staveIndex * (staveHeight + staveSpacing));
        const tempStave = new Stave(10, staveY, staveWidth);
        tempStave.setContext(context).draw();

        const notesForBeams = staveNotes.filter(note => note instanceof StaveNote) as StaveNote[];
        const totalBeats = Math.ceil(notesForBeams.length / subdivisionPerBeat);
        // Use exact beats - VexFlow handles tuplet compression automatically
        const tempVoice = new Voice({ numBeats: totalBeats, beatValue: 4 });
        tempVoice.setStrict(false); // Use non-strict mode to allow flexible durations (prevents "Too many ticks" error)
        tempVoice.addTickables(staveNotes);

        // Try to find optimal spacing that fits all notes
        let optimalSpacing = baseSpacing;
        let needsBreak = false;
        let breakBeforeIndex = -1;
        let lastBarlineX = 0;
        
        // Binary search for optimal spacing (between minSpacing and baseSpacing)
        let low = minSpacing;
        let high = baseSpacing;
        let bestSpacing = baseSpacing;
        let spacingFits = false;
        
        // Try progressively tighter spacing to fit the content
        for (let attempt = 0; attempt < 10; attempt++) {
            const testSpacing = Math.max(minSpacing, baseSpacing - (attempt * 0.1));
            const formatWidth = (staveWidth - 20) * testSpacing;
            const testFormatter = new Formatter();
            testFormatter.joinVoices([tempVoice]).format([tempVoice], formatWidth);
            
            // Check last barline position
            let barlineTooClose = false;
            for (let i = staveNotes.length - 1; i >= 0; i--) {
                if (staveNotes[i] instanceof BarNote) {
                    const barline = staveNotes[i] as BarNote;
                    try {
                        lastBarlineX = barline.getAbsoluteX();
                        const staveEndX = tempStave.getX() + tempStave.getWidth();
                        const distanceToEdge = staveEndX - lastBarlineX;
                        
                        if (distanceToEdge >= edgeThreshold) {
                            // This spacing works!
                            spacingFits = true;
                            bestSpacing = testSpacing;
                            break;
                        } else {
                            barlineTooClose = true;
                        }
                    } catch (e) {
                        // Estimate based on note count
                        const estimatedNoteWidth = formatWidth / staveNotes.length;
                        const estimatedBarlineX = 10 + (i * estimatedNoteWidth);
                        if (staveWidth - estimatedBarlineX >= edgeThreshold) {
                            spacingFits = true;
                            bestSpacing = testSpacing;
                            break;
                        } else {
                            barlineTooClose = true;
                        }
                    }
                    break;
                }
            }
            
            if (spacingFits) break;
        }
        
        optimalSpacing = bestSpacing;
        
        // If even minimum spacing doesn't fit, we need to break
        if (!spacingFits) {
            // Final format with minimum spacing to find break point
            const formatWidth = (staveWidth - 20) * minSpacing;
            const finalFormatter = new Formatter();
            finalFormatter.joinVoices([tempVoice]).format([tempVoice], formatWidth);
            
            for (let i = staveNotes.length - 1; i >= 0; i--) {
                if (staveNotes[i] instanceof BarNote) {
                    const barline = staveNotes[i] as BarNote;
                    try {
                        lastBarlineX = barline.getAbsoluteX();
                        const staveEndX = tempStave.getX() + tempStave.getWidth();
                        if (staveEndX - lastBarlineX < edgeThreshold) {
                            needsBreak = true;
                            // Find start of the bar before this barline
                            for (let j = i - 1; j >= 0; j--) {
                                if (staveNotes[j] instanceof BarNote || j === 0) {
                                    breakBeforeIndex = j + (j === 0 ? 0 : 1);
                                    break;
                                }
                            }
                        }
                    } catch (e) {
                        const estimatedNoteWidth = formatWidth / staveNotes.length;
                        const estimatedBarlineX = 10 + (i * estimatedNoteWidth);
                        if (staveWidth - estimatedBarlineX < edgeThreshold) {
                            needsBreak = true;
                            breakBeforeIndex = Math.max(0, i - notesPerBar);
                        }
                    }
                    break;
                }
            }
        }
        
        if (needsBreak && breakBeforeIndex > 0 && breakBeforeIndex < staveNotes.length) {
            const notesBefore = staveNotes.slice(0, breakBeforeIndex);
            const notesAfter = staveNotes.slice(breakBeforeIndex);
            
            // Remove trailing barline from notesBefore
            if (notesBefore[notesBefore.length - 1] instanceof BarNote) {
                notesBefore.pop();
            }
            
            reorganizedStaves.push(notesBefore);
            staveSpacings.push(optimalSpacing);
            
            if (staveIndex + 1 < initialStaves.length) {
                initialStaves[staveIndex + 1] = [...notesAfter, ...initialStaves[staveIndex + 1]];
            } else {
                reorganizedStaves.push(notesAfter);
                staveSpacings.push(baseSpacing); // Use base spacing for new stave
            }
        } else {
            reorganizedStaves.push(staveNotes);
            staveSpacings.push(optimalSpacing);
        }
    }
    
    // Update height if staves were reorganized
    const finalHeight = startY + (reorganizedStaves.length * (staveHeight + staveSpacing));
    if (finalHeight !== totalHeight) {
        // Recreate renderer with new height
        const container = document.getElementById(config.containerId);
        if (container) {
            container.innerHTML = '';
        }
        const { renderer: newRenderer, context: newContext } = createVexFlowRenderer({
            ...config,
            width: containerWidth, // Use container width to prevent scrolling
            height: finalHeight
        });
        // Update context reference
        Object.assign(context, newContext);
    }

    // Final rendering pass
    for (let staveIndex = 0; staveIndex < reorganizedStaves.length; staveIndex++) {
        const staveNotes = reorganizedStaves[staveIndex];
        if (staveNotes.length === 0) continue;

        // Calculate Y position for this stave
        const staveY = startY + (staveIndex * (staveHeight + staveSpacing));

        // Create stave
        const stave = new Stave(10, staveY, staveWidth);
        
        // Add clef and time signature only on first stave
        if (staveIndex === 0) {
            stave.addClef('percussion');
            stave.addTimeSignature(`${beatsPerBar}/4`);
        }
        
        stave.setContext(context).draw();

        // Filter out BarNotes for beam and tuplet calculation (beams/tuplets only work with StaveNotes)
        const notesForBeams = staveNotes.filter(note => note instanceof StaveNote) as StaveNote[];
        
        // Create tuplets if needed (for triplets, quintuplets, etc.)
        const tuplets: Tuplet[] = [];
        const beams: Beam[] = [];
        
        if (requiresTuplet(subdivisionPerBeat)) {
            const tupletRatio = getTupletRatio(subdivisionPerBeat);
            if (tupletRatio) {
                // Group notes by beat (subdivisionPerBeat notes per group)
                for (let i = 0; i < notesForBeams.length; i += subdivisionPerBeat) {
                    const beatNotes = notesForBeams.slice(i, i + subdivisionPerBeat);
                    // Only create tuplet if we have the expected number of notes
                    if (beatNotes.length === subdivisionPerBeat) {
                        const tuplet = new Tuplet(beatNotes, {
                            numNotes: tupletRatio[0],
                            notesOccupied: tupletRatio[1],
                            ratioed: false  // Show only the number (e.g., "6") without ratio (e.g., "6:4")
                        });
                        // Position tuplet bracket above to avoid overlapping with sticking annotations (which are below)
                        tuplet.setTupletLocation(Tuplet.LOCATION_TOP);
                        tuplet.setBracketed(true); // Ensure bracket is shown
                        tuplets.push(tuplet);
                        
                        // Create beams for tuplets to connect the notes (if 2 or more notes)
                        // Beams connect all notes in the tuplet group for cleaner appearance
                        if (beatNotes.length >= 2 && duration !== 'q' && duration !== 'w' && duration !== 'h') {
                            const beam = new Beam(beatNotes);
                            beams.push(beam);
                        }
                    }
                }
            }
        } else {
            // Create beams for regular (non-tuplet) notes
            if (duration !== 'q' && duration !== 'w' && duration !== 'h') {
                // Group notes by beat (subdivisionPerBeat notes per group)
                for (let i = 0; i < notesForBeams.length; i += subdivisionPerBeat) {
                    const beatNotes = notesForBeams.slice(i, i + subdivisionPerBeat);
                    // Only create beam if we have 2 or more notes in the group
                    if (beatNotes.length >= 2) {
                        const beam = new Beam(beatNotes);
                        beams.push(beam);
                    }
                }
            }
        }

        // Calculate how many bars are on this stave (exclude BarNotes from count)
        const actualNoteCount = notesForBeams.length;
        
        // Calculate total beats needed
        // Each group of subdivisionPerBeat notes represents 1 beat
        // This works for both regular subdivisions and tuplets because:
        // - Regular: 4 sixteenth notes = 1 beat
        // - Tuplets: 3 triplet 8th notes = 1 beat (compressed by tuplet)
        const totalBeats = Math.ceil(actualNoteCount / subdivisionPerBeat);
        
        // Use the exact number of beats needed - VexFlow handles tuplet compression automatically
        // Don't add buffer as it causes "IncompleteVoice" error
        const beatsWithBuffer = totalBeats;

        // Create voice and format for this stave (includes both notes and barlines)
        const voice = new Voice({ numBeats: beatsWithBuffer, beatValue: 4 });
        voice.setStrict(false); // Use non-strict mode to allow flexible durations (prevents "Too many ticks" error)
        voice.addTickables(staveNotes);

        // Use optimized spacing for this stave (automatically adjusted)
        const noteSpacing = staveSpacings[staveIndex] || (config.noteSpacing || 1.0);
        const formatWidth = (staveWidth - 20) * noteSpacing;

        const formatter = new Formatter();
        formatter.joinVoices([voice]).format([voice], formatWidth);
        voice.draw(context, stave);

        // Draw all tuplets (if any) - must be drawn before beams
        tuplets.forEach(tuplet => tuplet.setContext(context).draw());
        
        // Draw all beams (this will remove individual flags)
        beams.forEach(beam => beam.setContext(context).draw());

        // Add final barline at the end of the stave
        if (staveIndex < reorganizedStaves.length - 1) {
            stave.setEndBarType(3); // Double barline
        } else {
            stave.setEndBarType(0); // Single barline
        }
        
        // Redraw stave to show the final barline
        stave.setContext(context).draw();
    }
}



