class CanvasManager {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.levels = new Map();
        this.currentLevel = null;
        this.selectedBox = null;
        this.isDragging = false;
        this.isConnecting = false;
        this.startBox = null;
        this.levelStack = [];

        this.initializeCanvas();
        this.setupEventListeners();
        this.createInitialLevel();
    }

    initializeCanvas() {
        const resizeCanvas = () => {
            const container = document.getElementById('canvas-container');
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.draw();
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        document.getElementById('addBox').addEventListener('click', () => {
            this.addBox(50, 50);
        });

        document.getElementById('addLine').addEventListener('click', () => {
            this.isConnecting = true;
        });

        document.getElementById('back').addEventListener('click', () => {
            this.navigateBack();
        });

        document.getElementById('save').addEventListener('click', () => {
            this.saveToLocalStorage();
        });

        document.getElementById('load').addEventListener('click', () => {
            this.loadFromLocalStorage();
        });
    }

    createInitialLevel() {
        const rootLevel = new CanvasSchema.Level(crypto.randomUUID());
        this.levels.set(rootLevel.id, rootLevel);
        this.currentLevel = rootLevel;
    }

    addBox(x, y) {
        const box = this.currentLevel.addBox(x, y);
        this.draw();
        return box;
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedBox = this.findBoxAt(x, y);

        if (clickedBox) {
            if (this.isConnecting) {
                if (!this.startBox) {
                    this.startBox = clickedBox;
                } else {
                    this.currentLevel.addLine(this.startBox.id, clickedBox.id);
                    this.startBox = null;
                    this.isConnecting = false;
                    this.draw();
                }
            } else if (e.detail === 2) { // Double click
                this.zoomIntoBox(clickedBox);
            } else {
                this.selectedBox = clickedBox;
                this.isDragging = true;
            }
        }
    }

    handleMouseMove(e) {
        if (this.isDragging && this.selectedBox) {
            const rect = this.canvas.getBoundingClientRect();
            this.selectedBox.x = e.clientX - rect.left - this.selectedBox.width / 2;
            this.selectedBox.y = e.clientY - rect.top - this.selectedBox.height / 2;
            this.draw();
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.selectedBox = null;
    }

    findBoxAt(x, y) {
        return this.currentLevel.boxes.find(box => {
            return x >= box.x && x <= box.x + box.width &&
                   y >= box.y && y <= box.y + box.height;
        });
    }

    zoomIntoBox(box) {
        let childLevel = this.levels.get(box.id);
        if (!childLevel) {
            childLevel = new CanvasSchema.Level(box.id, this.currentLevel.id);
            this.levels.set(childLevel.id, childLevel);
        }
        this.levelStack.push(this.currentLevel);
        this.currentLevel = childLevel;
        this.draw();
    }

    navigateBack() {
        if (this.levelStack.length > 0) {
            this.currentLevel = this.levelStack.pop();
            this.draw();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw lines
        this.currentLevel.lines.forEach(line => {
            const startBox = this.currentLevel.boxes.find(b => b.id === line.startBoxId);
            const endBox = this.currentLevel.boxes.find(b => b.id === line.endBoxId);
            
            if (startBox && endBox) {
                this.ctx.beginPath();
                this.ctx.moveTo(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
                this.ctx.lineTo(endBox.x + endBox.width / 2, endBox.y + endBox.height / 2);
                this.ctx.stroke();
            }
        });

        // Draw boxes
        this.currentLevel.boxes.forEach(box => {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            
            // Draw box
            this.ctx.fillRect(box.x, box.y, box.width, box.height);
            this.ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw text
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(box.text, box.x + box.width / 2, box.y + box.height / 2);
        });
    }

    saveToLocalStorage() {
        const data = {
            levels: Array.from(this.levels.entries()),
            currentLevelId: this.currentLevel.id,
            levelStack: this.levelStack.map(level => level.id)
        };
        localStorage.setItem('canvasData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('canvasData'));
        if (data) {
            this.levels = new Map(data.levels);
            this.currentLevel = this.levels.get(data.currentLevelId);
            this.levelStack = data.levelStack.map(id => this.levels.get(id));
            this.draw();
        }
    }
}

// Initialize the canvas manager when the page loads
window.addEventListener('load', () => {
    window.canvasManager = new CanvasManager();
});