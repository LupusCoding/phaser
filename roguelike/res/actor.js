function Actor(hp, mp, x, y) {
    this.hp = hp;
    this.mp = mp;
    this.x = x;
    this.y = y;
    this.key = y + '_' + x;
}

Actor.prototype.updatePosition = function(x, y) {
    this.x = x;
    this.y = y;
    this.key = y + '_' + x;
}

Actor.prototype.aiAct = function (player) {
    var directions = [
        { x: -1, y:  0 },
        { x:  1, y:  0 },
        { x:  0, y: -1 },
        { x:  0, y:  1 },
        { x:  0, y:  0 }
    ];
    var dx = player.x - this.x;
    var dy = player.y - this.y;

    var move = null;

    if (Math.abs(dx) < 3 || Math.abs(dy) < 3) {
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                // left
                move = directions[0];
            } else {
                // right
                move = directions[1];
            }
        } else {
            if (dy < 0) {
                // up
                move = directions[2];
            } else {
                //down
                move = directions[3];
            }
        }
    } else {
        var rand = Math.floor(Math.random() * 10);
        switch (rand) {
            case 9:
            case 4:
                // up
                move = directions[2];
                break;
            case 8:
            case 3:
                //down
                move = directions[3];
                break;
            case 7:
            case 2:
                // right
                move = directions[1];
                break;
            case 6:
            case 1:
                // left
                move = directions[0];
                break;
            case 5:
            case 0:
                move = directions[4];
                break;
        }
    }
    return move;
}