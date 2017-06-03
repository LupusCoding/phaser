function Map(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.table = null;
    this.display = null;
    this.wall = 'wall';
    this.floor = 'floor';
}

Map.prototype.init = function () {
    this.table = [];
    for (var y = 0; y < this.rows; y++) {
        var newRow = [];
        for (var x = 0; x < this.cols; x++) {
            if (y == 0 || x == 0 || y == this.rows - 1 || x == this.cols - 1) {
                newRow.push(this.wall);
            } else {
                if (Math.random() > 0.8) {
                    newRow.push(this.wall);
                } else {
                    newRow.push(this.floor);
                }
            }
        }
        this.table.push(newRow);
    }
}

Map.prototype.setWall = function(chr) {
    this.wall = chr;
}

Map.prototype.setFloor = function(chr) {
    this.floor = chr;
}

Map.prototype.createCells = function () {
    this.display = [];
    for (var y = 0; y < this.rows; y++) {
        var newRow = [];
        this.display.push(newRow);
        for (var x = 0; x < this.cols; x++) {
            newRow.push(this.addSprite(this.table[y][x], x, y));
        }
    }
}

Map.prototype.draw = function () {
    for (var y = 0; y < this.rows; y++) {
        for (var x = 0; x < this.cols; x++) {
            this.display[y][x] = this.addSprite(this.table[y][x], x, y);
        }
    }
}

Map.prototype.addSprite = function (sprite, x, y) {
    return game.add.sprite(FONT * x, FONT * y, sprite);
}

Map.prototype.getCell = function (x, y) {
    return this.display[y][x];
}

Map.prototype.updateCell = function (x, y, sprite) {
    this.display[y][x] = this.addSprite(sprite, x, y);
}
