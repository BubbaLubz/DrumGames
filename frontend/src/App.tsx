import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { renderPattern } from './utils/vexflowRenderer';
import { rudimentAPI } from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [baseSticking, setBaseSticking] = useState('RLRL');
  const [gridSequence, setGridSequence] = useState('4,2,1');
  const [subdivisionPerBeat, setSubdivisionPerBeat] = useState(4);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [numberOfBars, setNumberOfBars] = useState(8);
  const [tempo, setTempo] = useState(120);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Parse grid sequence (comma-separated numbers)
      const sequenceArray = gridSequence
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n));
      
      if (sequenceArray.length === 0) {
        throw new Error('Grid sequence must contain at least one number');
      }
      
      // Validate base sticking (only R, L, or B)
      if (!/^[RLB]+$/i.test(baseSticking)) {
        throw new Error('Base sticking must only contain R, L, or B');
      }
      
      // Convert to uppercase
      const stickingUpper = baseSticking.toUpperCase();
      
      const patternSpec = await rudimentAPI.generateCustomGrid({
        base_sticking: stickingUpper,
        grid_sequence: sequenceArray,
        subdivision_per_beat: subdivisionPerBeat,
        beats_per_bar: beatsPerBar,
        number_of_bars: numberOfBars,
        tempo: tempo,
        switch_hand_on_repeat: false
      });
      
      // Debug: Log accent pattern for ALL bars
      const strokesPerBar = beatsPerBar * subdivisionPerBeat;
      const calculatedBars = Math.floor(patternSpec.strokes.length / strokesPerBar);
      
      console.log('=== ACCENT DEBUG (ALL BARS) ===');
      console.log('Grid sequence:', sequenceArray);
      console.log(`Beats per bar: ${beatsPerBar}, Subdivision: ${subdivisionPerBeat}, Strokes per bar: ${strokesPerBar}`);
      console.log(`Requested bars: ${numberOfBars}, Calculated bars: ${calculatedBars}, Total strokes: ${patternSpec.strokes.length}`);
      console.log(`Total accents: ${patternSpec.strokes.filter(s => s.isAccent).length}`);
      
      // Show accent pattern for each bar
      for (let bar = 0; bar < calculatedBars; bar++) {
        const barStart = bar * strokesPerBar;
        const barEnd = barStart + strokesPerBar;
        const barStrokes = patternSpec.strokes.slice(barStart, barEnd);
        const accentPattern = barStrokes.map(s => s.isAccent ? '^' : '.').join('');
        const accentPositions = barStrokes
          .map((s, i) => ({ index: barStart + i, accent: s.isAccent }))
          .filter(a => a.accent)
          .map(a => a.index - barStart);
        
        console.log(`Bar ${bar + 1}: accents at positions [${accentPositions.join(', ')}]`);
        console.log(`Bar ${bar + 1} visual: ${accentPattern}`);
      }
      
      // Render the pattern - width will be automatically determined from container
      renderPattern(patternSpec.strokes, beatsPerBar, subdivisionPerBeat, {
        containerId: 'notation-container',
        // Don't specify width - it will use container's actual width to prevent scrolling
        height: 200, // Height will be automatically adjusted based on number of bars
        noteSpacing: 0.5, // Adjust this value: < 1.0 = tighter spacing, > 1.0 = wider spacing
      });
      
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate grid';
      console.error('Error generating grid:', err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Rudiment Grid Generator</h1>
        
        <form onSubmit={handleGenerate} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Base Sticking (R, L, or B):
            </label>
            <input
              type="text"
              value={baseSticking}
              onChange={(e) => setBaseSticking(e.target.value)}
              placeholder="e.g., RLRL or RLRRLL"
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>Use R for right hand, L for left hand, B for both</small>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Grid Sequence (comma-separated):
            </label>
            <input
              type="text"
              value={gridSequence}
              onChange={(e) => setGridSequence(e.target.value)}
              placeholder="e.g., 4,2,1 or 2,1,4"
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>Numbers separated by commas (e.g., 4,2,1)</small>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Subdivision Per Beat:
            </label>
            <input
              type="number"
              value={subdivisionPerBeat}
              onChange={(e) => setSubdivisionPerBeat(parseInt(e.target.value) || 4)}
              min="1"
              max="8"
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>4 = sixteenth notes, 3 = triplets, 2 = eighth notes</small>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Beats Per Bar:
              </label>
              <input
                type="number"
                value={beatsPerBar}
                onChange={(e) => setBeatsPerBar(parseInt(e.target.value) || 4)}
                min="1"
                max="8"
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Number of Bars:
              </label>
              <input
                type="number"
                value={numberOfBars}
                onChange={(e) => setNumberOfBars(parseInt(e.target.value) || 8)}
                min="1"
                max="16"
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tempo (BPM):
              </label>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value) || 120)}
                min="60"
                max="200"
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Generating...' : 'Generate Grid'}
          </button>
        </form>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            Error: {error}
          </div>
        )}
      </div>
      
      <div id="notation-container" style={{ marginTop: '20px' }}></div>
    </div>
  );
}

export default App;
