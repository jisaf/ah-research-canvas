import React from 'react';
import { useCanvas } from '../context/CanvasContext';

function Toolbar() {
  const { dispatch } = useCanvas();

  const handleAddBox = () => {
    dispatch({
      type: 'ADD_BOX',
      x: 50,
      y: 50
    });
  };

  const handleStartConnecting = () => {
    dispatch({ type: 'START_CONNECTING' });
  };

  const handleBack = () => {
    dispatch({ type: 'NAVIGATE_BACK' });
  };

  return (
    <div style={{
      padding: '10px',
      backgroundColor: '#f0f0f0',
      borderBottom: '1px solid #ccc'
    }}>
      <button onClick={handleAddBox}>Add Box</button>
      <button onClick={handleStartConnecting}>Add Line</button>
      <button onClick={handleBack}>Back to Parent Level</button>
    </div>
  );
}

export default Toolbar;