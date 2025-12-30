import React from 'react';
import logo from './logo.svg';
import {useEffect} from 'react';
import './App.css';
import { renderPattern } from './utils/vexflowRenderer';
import { StrokeEvent } from './types';

function App() {
  useEffect(() => {
    // Sample data - 4 beats × 4 subdivisions = 16 strokes needed
    const sampleStrokes: StrokeEvent[] = [
      // Beat 1
      { hand: 'R', note_position: 0, tuplet: 0.25, isAccent: true, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'L', note_position: 0.25, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'R', note_position: 0.5, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'L', note_position: 0.75, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      // Beat 2
      { hand: 'R', note_position: 1.0, tuplet: 0.25, isAccent: true, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'L', note_position: 1.25, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'R', note_position: 1.5, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'L', note_position: 1.75, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      // Beat 3
      { hand: 'R', note_position: 2.0, tuplet: 0.25, isAccent: true, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'L', note_position: 2.25, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'R', note_position: 2.5, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'L', note_position: 2.75, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      // Beat 4
      { hand: 'R', note_position: 3.0, tuplet: 0.25, isAccent: true, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'L', note_position: 3.25, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'R', note_position: 3.5, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
      { hand: 'L', note_position: 3.75, tuplet: 0.25, isAccent: false, isDiddle: false, isFlam: false, isBuzz: false },
    ];
    
    renderPattern(sampleStrokes, 4, 4, {
      containerId: 'notation-container',
      width: 800,
      height: 200,
    });
  }, []);

  return (
    <div className="App">
      <div id="notation-container"></div>
    </div>
  );
}

export default App;
