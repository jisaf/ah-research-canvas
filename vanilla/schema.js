const CanvasSchema = {
    Box: class {
        constructor(id, x, y, width = 150, height = 100, text = 'New Box') {
            this.id = id;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.text = text;
            this.children = []; // Nested canvas level
        }
    },

    Line: class {
        constructor(id, startBoxId, endBoxId) {
            this.id = id;
            this.startBoxId = startBoxId;
            this.endBoxId = endBoxId;
        }
    },

    Level: class {
        constructor(id, parentBoxId = null) {
            this.id = id;
            this.parentBoxId = parentBoxId;
            this.boxes = [];
            this.lines = [];
        }

        addBox(x, y) {
            const box = new CanvasSchema.Box(crypto.randomUUID(), x, y);
            this.boxes.push(box);
            return box;
        }

        addLine(startBoxId, endBoxId) {
            const line = new CanvasSchema.Line(crypto.randomUUID(), startBoxId, endBoxId);
            this.lines.push(line);
            return line;
        }

        toJSON() {
            return {
                id: this.id,
                parentBoxId: this.parentBoxId,
                boxes: this.boxes,
                lines: this.lines
            };
        }

        static fromJSON(json) {
            const level = new CanvasSchema.Level(json.id, json.parentBoxId);
            level.boxes = json.boxes;
            level.lines = json.lines;
            return level;
        }
    }
};