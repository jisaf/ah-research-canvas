import React, { useRef, useEffect, useState } from 'react';
import { useCanvas } from '../context/CanvasContext';

function Canvas() {
  const canvasRef = useRef(null);
  const { state, dispatch } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBox, setDraggedBox] = useState(null);
  const [hoveredBox, setHoveredBox] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [startBox, setStartBox] = useState(null);
  const [editingBox, setEditingBox] = useState(null);
  const [editingText, setEditingText] = useState('');

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

    // Draw parent box text if it exists
    if (currentLevel.parentBoxId) {
      const parentLevel = state.levels.get(currentLevel.parentBoxId);
      const parentBox = parentLevel?.boxes.find(box => box.id === state.currentLevelId);
      if (parentBox) {
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Parent: ${parentBox.text}`, 10, 10);
      }
    }

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
      
      // Draw connection nodes if box is hovered
      if (hoveredBox && hoveredBox.id === box.id) {
        const nodeRadius = 5;
        ctx.fillStyle = '#4CAF50';
        
        // Top node
        ctx.beginPath();
        ctx.arc(box.x + box.width / 2, box.y, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Right node
        ctx.beginPath();
        ctx.arc(box.x + box.width, box.y + box.height / 2, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Bottom node
        ctx.beginPath();
        ctx.arc(box.x + box.width / 2, box.y + box.height, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Left node
        ctx.beginPath();
        ctx.arc(box.x, box.y + box.height / 2, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
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
      if (isConnecting) {
        // Complete the connection
        if (clickedBox.id !== startBox.id) {
          dispatch({
            type: 'ADD_LINE',
            startBoxId: startBox.id,
            endBoxId: clickedBox.id
          });
        }
        setIsConnecting(false);
        setStartBox(null);
      } else if (isNearNode(x, y, clickedBox)) {
        // Start a new connection
        setIsConnecting(true);
        setStartBox(clickedBox);
      } else if (e.detail === 2) { // Double click on box
        dispatch({ type: 'ZOOM_INTO_BOX', boxId: clickedBox.id });
      } else if (isClickingText(x, y, clickedBox)) {
        setEditingBox(clickedBox);
        setEditingText(clickedBox.text);
      } else {
        setIsDragging(true);
        setDraggedBox(clickedBox);
      }
    } else if (e.detail === 2) { // Double click on canvas
      dispatch({ type: 'ADD_BOX', x, y });
    }
  };

  const isNearNode = (x, y, box) => {
    const nodeRadius = 5;
    const nodes = [
      { x: box.x + box.width / 2, y: box.y }, // top
      { x: box.x + box.width, y: box.y + box.height / 2 }, // right
      { x: box.x + box.width / 2, y: box.y + box.height }, // bottom
      { x: box.x, y: box.y + box.height / 2 } // left
    ];
    
    return nodes.some(node => 
      Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2)) <= nodeRadius * 2
    );
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && draggedBox) {
      dispatch({
        type: 'MOVE_BOX',
        boxId: draggedBox.id,
        x: x - draggedBox.width / 2,
        y: y - draggedBox.height / 2
      });
    } else if (isConnecting) {
      // Draw temporary line while connecting
      draw();
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      const box = findBoxAt(x, y);
      if (box && (isNearNode(x, y, box) || !hoveredBox)) {
        setHoveredBox(box);
      } else if (!box) {
        setHoveredBox(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedBox(null);
  };

  const isClickingText = (x, y, box) => {
    const textX = box.x + box.width / 2;
    const textY = box.y + box.height / 2;
    const textWidth = 100; // Approximate width of text area
    const textHeight = 20; // Approximate height of text area
    
    return x >= textX - textWidth / 2 &&
           x <= textX + textWidth / 2 &&
           y >= textY - textHeight / 2 &&
           y <= textY + textHeight / 2;
  };

  const handleTextChange = (e) => {
    setEditingText(e.target.value);
  };

  const handleTextBlur = () => {
    if (editingBox) {
      dispatch({
        type: 'UPDATE_BOX_TEXT',
        boxId: editingBox.id,
        text: editingText
      });
      setEditingBox(null);
      setEditingText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTextBlur();
    }
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
      {editingBox && (
        <input
          type="text"
          value={editingText}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyPress={handleKeyPress}
          style={{
            position: 'absolute',
            left: editingBox.x + editingBox.width / 2 - 50,
            top: editingBox.y + editingBox.height / 2 - 10,
            width: '100px',
            textAlign: 'center',
            zIndex: 1000
          }}
          autoFocus
        />
      )}
    </div>
  );
}

export default Canvas;