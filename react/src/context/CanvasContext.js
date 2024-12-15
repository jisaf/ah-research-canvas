import React, { createContext, useContext, useReducer } from 'react';

const CanvasContext = createContext();

const ROOT_LEVEL_ID = 'root';

const initialState = {
  levels: new Map([[ROOT_LEVEL_ID, {
    id: ROOT_LEVEL_ID,
    boxes: [],
    lines: []
  }]]),
  currentLevelId: ROOT_LEVEL_ID,
  levelStack: [],
  selectedBox: null,
  isConnecting: false,
  startBox: null
};

function canvasReducer(state, action) {
  switch (action.type) {
    case 'ADD_BOX':
      const newBox = {
        id: crypto.randomUUID(),
        x: action.x,
        y: action.y,
        width: 150,
        height: 100,
        text: 'New Box'
      };
      
      const currentLevel = state.levels.get(state.currentLevelId);
      const updatedLevel = {
        ...currentLevel,
        boxes: [...currentLevel.boxes, newBox]
      };
      
      const newLevels = new Map(state.levels);
      newLevels.set(state.currentLevelId, updatedLevel);
      
      return {
        ...state,
        levels: newLevels
      };

    case 'ADD_LINE':
      const level = state.levels.get(state.currentLevelId);
      const newLine = {
        id: crypto.randomUUID(),
        startBoxId: action.startBoxId,
        endBoxId: action.endBoxId
      };
      
      const updatedLevelWithLine = {
        ...level,
        lines: [...level.lines, newLine]
      };
      
      const levelsWithNewLine = new Map(state.levels);
      levelsWithNewLine.set(state.currentLevelId, updatedLevelWithLine);
      
      return {
        ...state,
        levels: levelsWithNewLine,
        isConnecting: false,
        startBox: null
      };

    case 'MOVE_BOX':
      const levelWithBox = state.levels.get(state.currentLevelId);
      const updatedBoxes = levelWithBox.boxes.map(box =>
        box.id === action.boxId ? { ...box, x: action.x, y: action.y } : box
      );
      
      const updatedLevelWithBox = {
        ...levelWithBox,
        boxes: updatedBoxes
      };
      
      const levelsWithMovedBox = new Map(state.levels);
      levelsWithMovedBox.set(state.currentLevelId, updatedLevelWithBox);
      
      return {
        ...state,
        levels: levelsWithMovedBox
      };

    case 'ZOOM_INTO_BOX':
      let childLevel = state.levels.get(action.boxId);
      if (!childLevel) {
        childLevel = {
          id: action.boxId,
          parentBoxId: state.currentLevelId,
          boxes: [],
          lines: []
        };
      }
      
      const levelsWithChild = new Map(state.levels);
      levelsWithChild.set(childLevel.id, childLevel);
      
      return {
        ...state,
        levels: levelsWithChild,
        currentLevelId: childLevel.id,
        levelStack: [...state.levelStack, state.currentLevelId]
      };

    case 'NAVIGATE_BACK':
      if (state.levelStack.length === 0) return state;
      
      const previousLevelId = state.levelStack[state.levelStack.length - 1];
      return {
        ...state,
        currentLevelId: previousLevelId,
        levelStack: state.levelStack.slice(0, -1)
      };

    default:
      return state;
  }
}

export function CanvasProvider({ children }) {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  return (
    <CanvasContext.Provider value={{ state, dispatch }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}