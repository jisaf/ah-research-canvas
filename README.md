# Interactive Canvas with Infinite Nesting

This repository contains two implementations of an interactive canvas application that allows users to create, connect, and nest boxes with text:

1. Vanilla JavaScript implementation
2. React implementation

## Features

- Create boxes with text
- Connect boxes with lines
- Drag and move boxes (connected lines stay attached)
- Double-click to zoom into boxes (creates nested canvas levels)
- Navigate back to parent levels
- Save/Load functionality

## Vanilla JavaScript Version

Located in the `/vanilla` directory. To run:

1. Open `index.html` in a web browser

## React Version

Located in the `/react` directory. To run:

1. Navigate to the react directory: `cd react`
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Implementation Details

Both versions implement the same functionality with different architectural approaches:

- Vanilla JS uses classes and prototypes for a lightweight implementation
- React version uses Context API for state management and component-based architecture

## Data Structure

The canvas data is stored in a tree-like structure where:
- Each box can contain a nested canvas level
- Each level maintains its own set of boxes and connection lines
- Navigation history is maintained for level traversal