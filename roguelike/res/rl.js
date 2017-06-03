var FONT = 32;
var ROWS = 15;
var COLS = 30;

var ACTORS = 10;

var map;
var actorMap;

var asciidisplay;

var player;
var actorList;
var livingEnemies;
var score;
var Score;

var playerhp, playermp;
var enemyhp, enemymp;

var enemycounter;
var actlevel;

var gameover = 0;

var game = new Phaser.Game(COLS * FONT, ROWS * FONT, Phaser.CANVAS, 'game', { preload: preload, create: create });

function preload() {
    game.load.image('player', 'assets/happy.png');
    game.load.image('enemy', 'assets/bug.png');
    game.load.image('wall', 'assets/checkbox-unchecked.png');
    game.load.image('floor', 'assets/white.png');
}

function create() {
    game.input.keyboard.addCallbacks(null, null, onKeyUp);

    Score = new Score();

	playerhp = 5;
	playermp = 3;
	enemyhp = 1;
    enemymp = 1;

    actlevel = 0;
    score = 0;

    startlevel();
}

function startlevel() {
    actlevel++;

    map = new Map(ROWS, COLS);
    map.init();
    map.createCells();

    initActors();

    drawActors();
    showInfo();
}

function showInfo() {
    document.getElementById('level').innerHTML = 'level: ' + actlevel;
    document.getElementById('HP').innerHTML = 'HP: ' + player.hp;
    document.getElementById('enemies').innerHTML = 'Enemies on Map: ' + livingEnemies;
    document.getElementById('score').innerHTML = 'Score: ' + score;
}

function randomInt(max) {
	return Math.floor(Math.random() * max);
}

function initActors() {
	actorList = [];
	actorMap = {};
    for (var e = 0; e < ACTORS; e++) {
        var actor = new Actor(e == 0 ? playerhp : enemyhp, e == 0 ? playermp : enemymp, 0, 0);
        do {
            actor.updatePosition(randomInt(COLS), randomInt(ROWS));
        } while (map.table[actor.y][actor.x] == map.wall || actorMap[actor.key] != null);
        
		actorMap[actor.key] = actor;
		actorList.push(actor);
	}

	player = actorList[0];
	livingEnemies = ACTORS - 1;
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
            map.updateCell(actorList[a].x, actorList[a].y, a == 0 ? 'player' : 'enemy');
		}
	}
}

function canGo(actor, dir) {
	return actor.x+dir.x >= 0 &&
			actor.x+dir.x <= COLS -1 &&
			actor.y+dir.y >= 0 &&
			actor.y+dir.y <= ROWS -1 &&
			map.table[actor.y+dir.y][actor.x+dir.x] == map.floor;
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
                score++;
                map.updateCell(victim.x, victim.y, null, '#fff');
				if(livingEnemies == 0) {
					//var victory = game.add.text(game.world.centerX, game.world.centerY, 'Victory!\nCtrl+r to restart', { fill: '#2e2', align: 'center' });
					//victory.anchor.setTo(0.5,0.5);
                    startlevel();
                //} else {
                    //if (Math.random() < 0.2) {
                    //    map.updateCell(victim.x, victim.y, 'aid', '#fff');
                    //}
                }
			}
		}
	} else {
        actorMap[actor.key] = null;
        map.updateCell(actor.x, actor.y, null, '#fff');

        actor.updatePosition((actor.x + dir.x), (actor.y + dir.y));

        if (actor == player) {
            var color = '#0f0';
        } else {
            var color = '#f00';
        }

        map.updateCell(actor.x, actor.y, null, color);
		actorMap[actor.key] = actor;
	}
	return true;
}

function onKeyUp(event) {

    map.draw();

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
    showInfo();
}

function aiAct(actor) {
    moveTo(actor, actor.aiAct(player));
    if (player.hp < 1 && gameover != 1) {
        gameOver();
	}
}

function gameOver() {
    gameover = 1;
    var name = document.getElementById('name').value;
    if (name === '') {
        name = 'Anonymous';
    }
    var highscores = '';
    if (score > Score.getHighscore()) {
        highscores += '\nNEW HIGHSCORE! ' + score + '\n\n';
    }
    if (name != '' && name != null) {
        Score.setScore(name, score);
    }
    var scores = Score.getHighest();
    for (var s = 0; s < scores.length; s++) {
        highscores += (s+1) + ' Place: ' + scores[s].score + ' Points - ' + name + '\n';
    }
    var gameOver = game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER\nYour Score: ' + score + '\n' + highscores +'\nCtrl+r to restart', { fill: '#e22', align: 'center' });
    gameOver.anchor.setTo(0.5, 0.5);
}