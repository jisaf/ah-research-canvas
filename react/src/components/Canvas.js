import React, { useRef, useEffect, useState } from 'react';
import { useCanvas } from '../context/CanvasContext';

function Canvas() {
  const canvasRef = useRef(null);
  const { state, dispatch } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBox, setDraggedBox] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    draw();
  }, [state.levels, state.currentLevelId]);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentLevel = state.levels.get(state.currentLevelId);
    if (!currentLevel) return;

    // Draw lines
    currentLevel.lines.forEach(line => {
      const startBox = currentLevel.boxes.find(b => b.id === line.startBoxId);
      const endBox = currentLevel.boxes.find(b => b.id === line.endBoxId);
      
      if (startBox && endBox) {
        ctx.beginPath();
        ctx.moveTo(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
        ctx.lineTo(endBox.x + endBox.width / 2, endBox.y + endBox.height / 2);
        ctx.stroke();
      }
    });

    // Draw boxes
    currentLevel.boxes.forEach(box => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      
      ctx.fillRect(box.x, box.y, box.width, box.height);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      ctx.fillStyle = '#000000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(box.text, box.x + box.width / 2, box.y + box.height / 2);
    });
  };

  const findBoxAt = (x, y) => {
    const currentLevel = state.levels.get(state.currentLevelId);
    if (!currentLevel) return null;

    return currentLevel.boxes.find(box => 
      x >= box.x && x <= box.x + box.width &&
      y >= box.y && y <= box.y + box.height
    );
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedBox = findBoxAt(x, y);

    if (clickedBox) {
      if (state.isConnecting) {
        if (!state.startBox) {
          dispatch({ type: 'SET_START_BOX', boxId: clickedBox.id });
        } else {
          dispatch({
            type: 'ADD_LINE',
            startBoxId: state.startBox.id,
            endBoxId: clickedBox.id
          });
        }
      } else if (e.detail === 2) { // Double click
        dispatch({ type: 'ZOOM_INTO_BOX', boxId: clickedBox.id });
      } else {
        setIsDragging(true);
        setDraggedBox(clickedBox);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && draggedBox) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - draggedBox.width / 2;
      const y = e.clientY - rect.top - draggedBox.height / 2;

      dispatch({
        type: 'MOVE_BOX',
        boxId: draggedBox.id,
        x,
        y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedBox(null);
  };

  return (
    <div style={{ flexGrow: 1, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}

export default Canvas;