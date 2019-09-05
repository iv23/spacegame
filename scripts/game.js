var CANVAS_HEIGHT = 500,
    CANVAS_WIDTH = 500,
    FPS=30,
    ctx,
    canvas,
    body,
    playerBullets,
    enemies,
    id = 0,
    modulus = 10,
    game,
    rem,
    gameStarted=false;

//Initializing values

function init() {
    player.level = 1;
    canvas=document.getElementById("game");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    //Returns canvas context for drawing

    ctx = document.getElementById("game").getContext("2d");
    playerBullets = [];
    enemies = [];
    gameStart();

    //Returns ID value of the timer that is set.

    game = setInterval( gameLoop, 1000/FPS );
}

function gameStart() {
    gameStarted = true;
}

function clearCanvas() {
    ctx.clearRect( 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT );
}

function gameLoop() {
    if( gameStarted )
        update();
    draw();
}

//Player object

var player = {
    active: true,
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 70,
    level: 1,
    enemiesMissed: 0,
    enemiesMissedLimit: 3,
    width: 32,
    height: 32,
    sprite: Sprite("player"),
    draw: function() {
        this.sprite.draw(ctx, this.x, this.y);
    },
    explode: function() {
        Sound.play("explosion");
        //drawExplosion( this.x, this.y);
        this.active = false;
    },
    shoot: function() {
        Sound.play("shoot");
        var bulletPosition = this.midpoint ( );
        playerBullets.push( Bullet( {
            speed: 10 ,
            x: bulletPosition.x ,
            y: bulletPosition.y
        }));
    },
    midpoint: function () {
        return {
            x: ( this.x + this.width / 2 ) - .5,
            y: this.y
        };
    }
};

player.explosionId = undefined;
player.explosionSprites = Array(48).fill("e").map((e,idx)=>Sprite(e+idx));
player.explode = function () {
    Sound.play("explosion");
    var i = 0;
    ctx.clearRect(player.x, player.y, player.width, player.height);
    player.explosionId = setInterval( function() {
        if ( i < player.explosionSprites.length )
        {
            player.explosionSprites[i].draw( ctx, player.x, player.y);
            i++;
        }
        else clearInterval( player.explosionId );
    }, 1000/FPS);
    player.active = false;
};

//Score object

var score={
    totalScore: 0,
    color:" #000",
    x: 460,
    y: 15,
    calcScoreAndLevel: function(reward ) {
        this.totalScore += reward;
        player.level = Math.floor(score.totalScore / 100)+1;
    },
    drawScore: function() {
        ctx.font = "15px Verdana";
        ctx.fillText( 'Score: ', 400, 15 );
        ctx.fillText( String(this.totalScore), this.x, this.y );
        ctx.fillText( "Missed: ", 10, 15 );
        var display = String( player.enemiesMissed ) + "/" + String( player.enemiesMissedLimit );
        ctx.fillText( display, 70, 15 );
        ctx.fillText( "Level: ", 10, 35 );
        ctx.fillText( String( player.level ), 70, 35 );
    }
};

//Player bullets constructor
function Bullet( I ) {
    I.active = true;
    I.xVelocity = 0;
    I.yVelocity =- I.speed;
    I.width = 3;
    I.height = 6;
    I.color = "#000";
    I.inBounds = function() {
        return I.x >= 0 && I.x <= CANVAS_WIDTH &&
            I.y >= 0 && I.y <= CANVAS_HEIGHT;
    };
    I.draw = function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    I.update = function() {
        I.x += I.xVelocity;
        I.y += I.yVelocity;
        I.active = I.active && I.inBounds();
    };
    return I;
}

//Enemy constructor
function Enemy( I ) {
    I = I || {};
    I.active = true;
    I.explosionId = undefined;
    I.explosionSprites = Array(48).fill("e").map((e,idx)=>Sprite(e+idx));
    I.age = Math.floor( Math.random() * 12 );
    I.x = CANVAS_WIDTH / 5 + Math.random() * CANVAS_WIDTH / 2;
    I.y = 0;
    I.enemyType = [ "enemy" , "enemy2" ];
    I.sprite = Sprite( I.enemyType[0] );
    I.reward = 20;
    I.xVelocity = 0;
    I.yVelocity = player.level * .5;
    I.width = 32;
    I.height = 32;

    //If player reaches level 5 different enemy sprite is used with 20 reward

    if ( player.level >= 5 ) {
        I.sprite = Sprite( I.enemyType[1] );
        I.reward = 20;
    } else {
        I.sprite = Sprite( I.enemyType[0] );
        I.reward = 10;
    }
    I.inBounds = function() {
        return I.x >= 0 && I.x <= CANVAS_WIDTH &&
            I.y >= 0 && I.y <= CANVAS_HEIGHT;
    };
    I.draw = function() {
        this.sprite.draw(ctx, this.x, this.y);
    };
    I.update=function() {
        I.x = I.x.clamp(0, CANVAS_WIDTH - this.width);
        I.x += I.xVelocity;
        I.y += I.yVelocity;
        I.xVelocity = 3 * Math.sin(I .age * Math.PI / 64);
        I.age++;
        I.active = I.active && I.inBounds( );
    };
    I.explode = function() {
        Sound.play("explosion");
        this.active = false;
        var i = 0;
        I.explosionId = setInterval(function() {
            if(i<I.explosionSprites.length)
            {
                I.explosionSprites[i].draw( ctx, I.x, I.y );
                i++;
            }
            else clearInterval( I.explosionId );
        }, 1000/FPS);
    };
    return I;
}

function update() {
    if ( keydown.left ) {
        player.x -= 5;
    }
    if ( keydown.right ) {
        player.x += 5;
    }
    if ( keydown.space ) {
        if( id % modulus === 0 ) {
            player.shoot();
            if ( id === 200 ) {
                id = 0;
            }
        }
        id++;
    }
    else {
        rem = id % modulus;
        id -= rem;
    }

    player.x = player.x.clamp( 0, CANVAS_WIDTH - player.width );

    playerBullets.forEach( function( bullet ) {
        bullet.update();
    });
    playerBullets = playerBullets.filter( function( bullet ) {
        return bullet.active;
    });
    enemies.forEach( function( enemy ) {
        enemy.update();
    });
    enemies = enemies.filter( function( enemy ) {
        return enemy.active;
    });
    handleCollisions();
    handleMisses();
    if ( Math.random() < 0.02 ) {
        enemies.push( Enemy());
    }
}

function draw() {
    clearCanvas();
    if ( player.active ) {
        player.draw();
        score.drawScore();
        playerBullets.forEach( function( bullet ) {
            bullet.draw();
        } );
        enemies.forEach( function( enemy ) {
            enemy.draw();
        });
    }
    else
        gameOver();
}

//Rectangular collision detection algorithm

function collides( a, b ) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
function handleCollisions() {
    playerBullets.forEach( function( bullet ) {
        enemies.forEach( function( enemy ) {
            if ( collides( bullet , enemy ) ) {
                score.calcScoreAndLevel( enemy.reward );
                enemy.explode();
                bullet.active = false;
            }
        });
    });
    enemies.forEach( function( enemy ) {
        if ( collides( enemy , player ) ){
            enemy.explode();
            player.explode();
        }
    })
}
function handleMisses(){
    enemies.forEach( function ( enemy ) {
        if ( enemy.y > player.y - enemy.height ) {
            player.enemiesMissed++;
            enemy.explode();
            if ( player.enemiesMissed === player.enemiesMissedLimit ) {
                player.explode();
            }
        }
    })
}
function gameOver() {
    clearCanvas();
    gameStarted = false;
    ctx.textAlign = "center";
    ctx.fillText( "Game Over!" , CANVAS_WIDTH / 2 , CANVAS_HEIGHT / 2 );
    ctx.fillText( "Press Enter to Restart." , CANVAS_WIDTH / 2 , ( CANVAS_HEIGHT / 2 ) + 35 );
    if ( keydown.return ){
        restart();
    }
}


function restart(){
        clearCanvas();
        clearInterval( game );
        player.level = 1;
        id = 0;
        player.active = true;
        score.totalScore = 0;
        player.enemiesMissed = 0;
        init();
}

window.onload = init;
