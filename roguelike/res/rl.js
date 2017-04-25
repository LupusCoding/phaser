var FONT = 32;
var ROWS = 15;
var COLS = 40;

var ACTORS = 10;

var map;
var actorMap;

var asciidisplay;

var player;
var actorList;
var livingEnemies;

var playerhp, playermp;
var enemyhp, enemymp;

var enemycounter;
var actlevel;

var game = new Phaser.Game(COLS * FONT * 0.6, ROWS * FONT, Phaser.CANVAS, 'game', { create: create });

function create() {
	game.input.keyboard.addCallbacks(null, null, onKeyUp);

	initMap();

	asciidisplay = [];
	for( var y = 0; y < ROWS; y++) {
		var newRow = [];
		asciidisplay.push(newRow);
		for( var x = 0; x < COLS; x++) {
			newRow.push( initCell('', x, y) );
		}
	}

	playerhp = 3;
	playermp = 3;
	enemyhp = 1;
    enemymp = 1;

    actlevel = 1;

	initActors();

	drawMap();
	drawActors();
    //enemycounter = game.add.text(1, 1, 'living enemies: '+livingEnemies, { fill: '#e22', align: 'left' });
    showInfo();
}

function initMap() {
	map = [];
	for( var y = 0; y < ROWS; y++) {
		var newRow = [];
		for( var x = 0; x < COLS; x++) {
			if( y == 0 || x == 0 || y == ROWS-1 || x == COLS-1 ) {
				newRow.push('#');
			} else {
				if(Math.random() > 0.8) {
					newRow.push('#');
				} else {
					newRow.push('.');
				}
			}
		}
		map.push(newRow);
	}
}

function drawMap() {
	for( var y = 0; y < ROWS; y++) {
		for( var x = 0; x < COLS; x++) {
			asciidisplay[y][x].text = map[y][x];
		}
	}
}

function initCell(chr, x, y) {
	var style = { font: FONT + "px monospace", fill: "#fff" };
	return game.add.text(FONT * 0.6 * x, FONT * y, chr, style);
}

function updateCell(x, y, chr, color) {
    if (color != '' && color != null) {
        asciidisplay[y][x].style.fill = color;
    }
    if (chr != '' && chr != null) {
        asciidisplay[y][x].text = chr;
    } else {
        asciidisplay[y][x].text = asciidisplay[y][x].text;
    }
}

function randomInt(max) {
	return Math.floor(Math.random() * max);
}

function initActors() {
	actorList = [];
	actorMap = {};
	for( var e= 0; e < ACTORS; e++) {
		var actor = {
			x: 0,
			y: 0,
			hp: e == 0 ? playerhp : enemyhp,
			mp: e == 0 ? playermp : enemymp
		};
		do {
			actor.y = randomInt(ROWS);
			actor.x = randomInt(COLS);
		} while (map[actor.y][actor.x] == '#' || actorMap[actor.y + '_' + actor.x] != null);

		actorMap[actor.y + '_' + actor.x] = actor;
		actorList.push(actor);
	}

	player = actorList[0];
	livingEnemies = ACTORS - 1;
}

function showInfo() {
    document.getElementById('level').innerHTML = 'level: ' + actlevel;
    document.getElementById('HP').innerHTML = 'HP: ' + player.hp;
    document.getElementById('enemies').innerHTML = 'Enemies on Map: ' + livingEnemies;
}

function updateEcount() {
	enemycounter.text = 'living enemies: '+livingEnemies;
}

function drawActors() {
	for ( var a in actorList ) {
		if (actorList[a] == null) {
			continue;
		}
        if (actorList[a].hp > 0) {
            updateCell(actorList[a].x, actorList[a].y, a == 0 ? '@' : 'e', a == 0 ? '#0f0' : '#f00');
		}
	}
}

function canGo(actor, dir) {
	return actor.x+dir.x >= 0 &&
			actor.x+dir.x <= COLS -1 &&
			actor.y+dir.y >= 0 &&
			actor.y+dir.y <= ROWS -1 &&
			map[actor.y+dir.y][actor.x+dir.x] == '.';
}

function moveTo(actor, dir) {
	if(!canGo(actor, dir)) {
		return false;
	}

	var newKey = (actor.y + dir.y) + '_' + (actor.x + dir.x);
	if(actorMap[newKey] != null) {
        var victim = actorMap[newKey];
        if ((actor == player && victim != player) || (actor != player && victim == player)) {
            victim.hp--;
        }

		if(victim.hp == 0) {
			actorMap[newKey] = null;
			if(actorList[actorList.indexOf(victim)] == null) {
				console.debug('victim: '+actorList.indexOf(victim));
				console.debug('actorlist: '+actorList);
			}
			actorList[actorList.indexOf(victim)] = null;
			if(victim != player) {
                livingEnemies--;
                updateCell(victim.x, victim.y, null, '#fff');
				if(livingEnemies == 0) {
					var victory = game.add.text(game.world.centerX, game.world.centerY, 'Victory!\nCtrl+r to restart', { fill: '#2e2', align: 'center' });
					victory.anchor.setTo(0.5,0.5);
				}
			}
		}
	} else {
        actorMap[actor.y + '_' + actor.x] = null;
        updateCell(actor.x, actor.y, null, '#fff');

		actor.y = actor.y + dir.y;
        actor.x = actor.x + dir.x;

        if (actor == player) {
            var color = '#0f0';
        } else {
            var color = '#f00';
        }
        updateCell(actor.x, actor.y, null, color);
		actorMap[actor.y + '_' + actor.x] = actor;
	}
	return true;
}

function onKeyUp(event) {

	drawMap();

	var acted = false;
	switch (event.keyCode) {
        case Phaser.Keyboard.LEFT:
        	acted = moveTo(player, {x: -1, y:0});
        	break;
        case Phaser.Keyboard.RIGHT:
        	acted = moveTo(player, {x: 1, y:0});
        	break;
        case Phaser.Keyboard.UP:
        	acted = moveTo(player, {x: 0, y:-1});
        	break;
        case Phaser.Keyboard.DOWN:
        	acted = moveTo(player, {x: 0, y:1});
        	break;
    }

    if(acted) {
    	for( var enemy in actorList) {
    		if(enemy == 0) {
    			continue;
    		}
    		var e = actorList[enemy];
    		if(e != null) {
    			aiAct(e);
    		}
    	}
    }
    drawActors();
	//updateEcount();
    showInfo();
}

function aiAct(actor) {
	var directions = [ 
		{ x: -1, y: 0 },
		{ x: 1, y: 0  },
		{ x: 0, y: -1 },
		{ x: 0, y: 1  }
	];
	var dx = player.x - actor.x;
	var dy = player.y - actor.y;

	 if(Math.abs(dx) < 3 || Math.abs(dy) < 3) {
		if(Math.abs(dx) > Math.abs(dy)) {
			if(dx < 0) {
				// left
				moveTo(actor, directions[0]);
			} else {
				// right
				moveTo(actor, directions[1]);
			}
		} else {
			if(dy < 0) {
				// up
				moveTo(actor, directions[2]);
			} else {
				//down
				moveTo(actor, directions[3])
			}
		}
	 } else {
	 	var rand = Math.floor(Math.random()*10);
	 	switch(rand) {
	 		case 9:
	 	    case 4:
	 			// up
	 			moveTo(actor, directions[2]);
	 			break;
	 	    case 8:
	 	    case 3:
	 			//down
	 			moveTo(actor, directions[3])
	 			break;
	 	    case 7:
	 	    case 2:
	 			// right
	 			moveTo(actor, directions[1]);
	 			break;
	 	    case 6:
	 	    case 1:
	 			// left
	 			moveTo(actor, directions[0]);
	 			break;
	 	    case 5:
	 	    case 0:
	 			break;
	 	}
	 }
	if(player.hp < 1) {
		var gameOver = game.add.text(game.world.centerX, game.world.centerY, 'Game Over\nCtrl+r to restart', { fill: '#e22', align: 'center' });
		gameOver.anchor.setTo(0.5,0.5);
	}
}