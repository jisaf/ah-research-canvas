import React from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import { CanvasProvider } from './context/CanvasContext';
import './styles/globals.css';

function App() {
  return (
    <CanvasProvider>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        <Canvas />
      </div>
    </CanvasProvider>
  );
}

export default App;