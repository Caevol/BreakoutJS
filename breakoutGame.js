
var breakout = (function(graphics, input){
    let gameState = {};
    let prevTime = 0;
    let gameRenderer = renderer;
    let imageBackground = {source : 'img/backdrop.png', ready : false};
    let background = new Image();
    background.src = imageBackground.source;

    let MAX_X = 1200;
    let MAX_INTERVAL = 1000;
    let BRICK_PARTICLES = 30;
    let PLATFORM_SPEED = 1;
    let MAX_PARTICLE_SPEED = .03;
    let MAX_ROTATION = Math.PI / 3;

    function Ball(x, y){
        let velx = Math.random();
        let vely = -1 * Math.sqrt(1 - Math.pow(velx, 2));
        return {
            x : x,
            y : y,
            radius : 25,
            speed : .75,
            velx : velx,
            vely : vely
        };
    }

    function Brick(x, y, color, score, isTop){
        return {
            x : x,
            y : y,
            width : 60,
            height : 40,
            color : color,
            score : score,
            isTop: isTop
        };
    }

    function Platform(x, y, width, height){
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    }

    function Particle(x, y, size, vely, velRotation, rotation, lifeTime){
        return {
            x: x,
            y: y,
            size: size,
            vely : vely,
            velRotation: velRotation,
            rotation: rotation,
            lifeTime: lifeTime
        };
    }

    function rebuildGame(){
        gameState = {
            score: 0,
            balls :[],
            platform : Platform(325, graphics.canvas.height - 110, 450, 50),
            remainingPlatforms : 3,
            particles: [],
            bricks : [],
            paddingx: 50,
            paddingy: 50,
            continueGame: true,
            countdown: 3000,
            bricksDestroyed : 0,
            topRowDamaged : false,
            nextSpeedThreshold : 4,
            last100 : 0
        };

        createBrickRow(15, 200, "rgb(50, 205, 50)", true,5); //Green
        createBrickRow(15, 250, "rgb(50, 205, 50)", false,5);
        createBrickRow(15, 300, "rgb(30, 144, 255)", false,3); //Blue
        createBrickRow(15, 350, "rgb(30, 144, 255)", false,3);
        createBrickRow(15, 400, "rgb(255, 127, 80)", false,2); //Orange
        createBrickRow(15, 450, "rgb(255, 127, 80)", false,2);
        createBrickRow(15, 500, "rgb(255, 255, 153)",false, 1); //Yellow
        createBrickRow(15, 550, "rgb(255, 255, 153)", false,1);

    }

    function createBrickRow(n, y, color, isTop, score){
        let brickset = [];
        for(let x = 0; x < n; x += 1){
            brickset.push(Brick(gameState.paddingx + 10 + x * 70, y, color, score, isTop));
        }
        gameState.bricks.push(brickset);
    }

    function updateScores(){
        let scores = [];
        if(localStorage.scores !== undefined)
            scores = JSON.parse(localStorage.scores);
        scores.push(gameState.score);
        scores.sort((a,b)=>a-b);
        scores.reverse();
        while(scores.length < 5) scores.push(-1);
        if(scores.length > 5) scores.length = 5;
        localStorage.scores = JSON.stringify(scores);
    }

    function replacePlatform(){
        gameState.remainingPlatforms -= 1;
        if(gameState.remainingPlatforms === 0){

            updateScores();
            rebuildGame(); // GAME OVER ADD SCORE REGISTER
        }
        else {
            gameState.platform.x = 325;
        }
    }

    function loseLife(){
        replacePlatform();
        gameState.platform.width = 450;
        gameState.countdown = 3000;
        gameState.bricksDestroyed = 0;
        gameState.topRowDamaged = false;
        gameState.nextSpeedThreshold = 4;
    }

    function update(elapsedTime){
        if(elapsedTime > MAX_INTERVAL) return;

        if(gameState.hasOwnProperty('countdown') === false && gameState.balls.length === 0){
            loseLife();
        }

        if(gameState.hasOwnProperty('countdown')){
            gameState.countdown -= elapsedTime;
            if(gameState.countdown <= 0) {
                delete gameState.countdown;
                gameState.balls.push(Ball(gameState.platform.x + gameState.platform.width / 2, gameState.platform.y - 20));
            }
        }
        else {
            updateBalls(elapsedTime);
            updateParticles(elapsedTime);
        }

        let brickCount = 0;
        for(let gr = 0; gr < gameState.bricks.length; gr += 1){
            brickCount += gameState.bricks[gr].length;
        }
        if(brickCount <= 0){
            updateScores();
            rebuildGame();
        }

    }

    function updateParticles(elapsedTime) {
        let keepParticles = [];


        for(let i = 0; i < gameState.particles.length; i += 1){
            let particle = gameState.particles[i];
            particle.y += particle.vely * elapsedTime;
            particle.rotation += particle.velRotation * elapsedTime;
            particle.lifeTime -= elapsedTime;

            if(particle.lifeTime > 0) keepParticles.push(particle);
        }

        gameState.particles = keepParticles;
    }

    function updateBalls(elapsedTime){
        let keepBalls = [];

        for(let i = 0; i < gameState.balls.length; i += 1){
            let ball = gameState.balls[i];
            ball.x += ball.velx * ball.speed * elapsedTime;
            ball.y += ball.vely * ball.speed * elapsedTime;

            //check for collisions with ball and make adjustments
            //wall collisions / out of bounds
            wallCollisions(ball);
            //platform collisions
            platformCollisions(ball);

            //brick collisions
            brickCollisions(ball);

            //off the edge destroy the ball
            if (ball.y < graphics.canvas.height){
                keepBalls.push(ball);
            }
        }
        gameState.balls = keepBalls;
    }



    function brickCollisions(ball){


        for(let gr = 0; gr < gameState.bricks.length; gr += 1) {
            let keepBricks = [];

            let brickGroup = gameState.bricks[gr];
            let groupSize = brickGroup.length;
            for (let i = 0; i < brickGroup.length; i += 1) {
                let brick = brickGroup[i];
                //in range
                //top, down velocity
                if (ball.vely > 0
                    && (ball.y + ball.radius > brick.y && ball.y < brick.y)
                    && (ball.x < brick.x + brick.width && ball.x > brick.x)) {
                    ball.vely *= -1;
                    destroyBrick(brick, brickGroup);
                }
                //bottom
                else if (ball.vely < 0
                    && (ball.y - ball.radius < brick.y + brick.height && ball.y > brick.y + brick.height)
                    && (ball.x < brick.x + brick.width && ball.x > brick.x)) {
                    ball.vely *= -1;
                    destroyBrick(brick, brickGroup);
                }
                //left side
                else if (ball.velx > 0
                    && ball.y > brick.y && ball.y < brick.y + brick.height
                    && ball.x < brick.x && ball.x + ball.radius > brick.x) {
                    ball.velx *= -1;
                    destroyBrick(brick, brickGroup);
                }
                //right side
                else if (ball.velx < 0
                    && ball.y > brick.y && ball.y < brick.y + brick.height
                    && ball.x > brick.x + brick.width && ball.x - ball.radius < brick.x + brick.width) {
                    ball.velx *= -1;
                    destroyBrick(brick, brickGroup);
                }
                //corner cases
                else if (checkCornerCollision(ball, brick) === true) {
                    destroyBrick(brick, brickGroup);
                }
                else {
                    keepBricks.push(brick)
                }
            }
            gameState.bricks[gr] = keepBricks;
            if(groupSize > 0 && gameState.bricks[gr].length === 0) gameState.score += 25;
        }



    }

    function checkCornerCollision(ball, brick){
        let v1 = [brick.x, brick.y];
        let v2 = [brick.x + brick.width, brick.y];
        let v3 = [brick.x, brick.y + brick.height];
        let v4 = [brick.x + brick.width, brick.y + brick.height];

        let angle = -10;

        if(Math.sqrt(Math.pow(ball.x - v1[0],2) + Math.pow(ball.y - v1[1],2)) < ball.radius){
            //top left
            angle = getAngle(ball, v1);
        }
        else if(Math.sqrt(Math.pow(ball.x - v2[0],2) + Math.pow(ball.y - v2[1],2)) < ball.radius){
            //top right
            angle = getAngle(ball, v2);
        }
        else if(Math.sqrt(Math.pow(ball.x - v3[0],2) + Math.pow(ball.y - v3[1],2)) < ball.radius){
            //bottom left
            angle = getAngle(ball, v3);
        }
        else if(Math.sqrt(Math.pow(ball.x - v4[0],2) + Math.pow(ball.y - v4[1],2)) < ball.radius){
            //bottom right
            angle = getAngle(ball, v4);
        }

        if(angle !== -10){
            ball.velx = Math.cos(angle);
            ball.vely = Math.sin(angle);

            return true;
        }
        return false;
    }

    function destroyBrick(brick, brickGroup){
        //create surface area of particles, leave the rest of it to the collision system.
        for(let i = 0; i < BRICK_PARTICLES; i += 1){
            let pos = Math.floor(Math.random() * (brick.width * brick.height));
            let posx = pos % brick.width + brick.x;
            let posy = Math.floor(pos / brick.height) + brick.y;
            let vely = (posy / (brick.height  - 1)) * MAX_PARTICLE_SPEED;
            let velRotation = Math.random() * MAX_ROTATION;
            let size = 5 + Math.random() * 15;
            let lifetime = Math.floor(450 + Math.random() * 1000);
            gameState.particles.push(Particle(posx, posy, size, vely, velRotation, Math.random() * (Math.PI * 2), lifetime));
        }

        addScores(brick, brickGroup);

    }

    function addScores(brick, brickGroup){
        gameState.score += brick.score;
        gameState.bricksDestroyed += 1;

        if(brick.isTop && gameState.topRowDamaged === false){
            gameState.topRowDamaged = true;
            gameState.platform.width = gameState.platform.width / 2;
        }
        if(gameState.score - gameState.last100 >= 100){
            gameState.last100 += 100;
            gameState.balls.push(Ball(gameState.platform.x + gameState.platform.width / 2, gameState.platform.y - 20));
            gameState.balls[gameState.balls.length -1 ].speed = gameState.balls[0].speed;
        }

        if(gameState.bricksDestroyed >= gameState.nextSpeedThreshold){
            gameState.nextSpeedThreshold *= 2;
            incrementBallSpeed(.1);
        }

    }

    function incrementBallSpeed(speed){
        for(let i = 0; i < gameState.balls.length; i += 1){
            gameState.balls[i].speed += speed;
        }
    }

    function getAngle(ball, point){
        return Math.atan2(ball.y - point[1], ball.x - point[0]);
    }

    function platformCollisions(ball){
        if (ball.vely < 0) return;

        if (ball.y + ball.radius >= gameState.platform.y && ball.y < gameState.platform.y) {
            if(ball.x >= gameState.platform.x && ball.x <= gameState.platform.x + gameState.platform.width){
                //standard collision, middle of the ball
                let platMid = gameState.platform.width / 2 + gameState.platform.x;
                let newXVel = (ball.x - platMid) / (gameState.platform.width / 2);
                ball.velx = newXVel;
                ball.vely = -1 * Math.sqrt(1 - Math.pow(ball.velx,2));
            }

            else if(Math.sqrt(Math.pow(gameState.platform.x - ball.x,2) + Math.pow(gameState.platform.y - ball.y,2)) < ball.radius){
                //left collision special
                ball.velx = -.9;
                ball.vely = -1 * Math.sqrt(1 - Math.pow(ball.velx, 2));
            }
            else if(Math.sqrt(Math.pow(gameState.platform.x + gameState.platform.width - ball.x,2) + Math.pow(gameState.platform.y - ball.y,2)) < ball.radius){
                //left collision special
                ball.velx = .9;
                ball.vely = -1 * Math.sqrt(1 - Math.pow(ball.velx, 2));
            }

        }

        if(ball.x + ball.radius >= gameState.platform.x
            && ball.x < gameState.platform.x
            && ball.y > gameState.platform.y
            && ball.y < gameState.platform.y + gameState.platform.height
            && ball.velx > 0){
            ball.velx *= -1;
        }
        if(ball.x - ball.radius <= gameState.platform.x + gameState.platform.width
            && ball.x > gameState.platform.x + gameState.platform.width
            && ball.y > gameState.platform.y
            && ball.y < gameState.platform.y + gameState.platform.height
            && ball.velx < 0){
            ball.velx *= -1;
        }

    }

    function wallCollisions(ball){
        if (ball.x - ball.radius < gameState.paddingx && ball.velx < 0) ball.velx *= -1;

        if (ball.x + ball.radius > MAX_X - gameState.paddingx && ball.velx > 0) ball.velx *= -1;

        if (ball.y - ball.radius < gameState.paddingy && ball.vely < 0) ball.vely *= -1;
    }

    function moveLeft(elapsedTime){
        gameState.platform.x -= PLATFORM_SPEED * elapsedTime;
        if(gameState.platform.x < gameState.paddingx) gameState.platform.x = gameState.paddingx;
    }

    function moveRight(elapsedTime){
        gameState.platform.x += PLATFORM_SPEED * elapsedTime;
        if(gameState.platform.x + gameState.platform.width > MAX_X - gameState.paddingx) gameState.platform.x = MAX_X - gameState.paddingx - gameState.platform.width;
    }

    function handleInput(elapsedTime){
        Keyboard.update(elapsedTime);
    }

    function render(elapsedTime){
        gameRenderer.clear();

        //background
        gameRenderer.drawBackground(background, imageBackground);

        //bricks
        gameRenderer.drawBricks(gameState.bricks);

        //particles
        gameRenderer.drawParticles(gameState.particles);

        gameRenderer.drawBalls(gameState.balls);

        gameRenderer.drawPlatform(gameState.platform);

        gameRenderer.drawWalls(gameState.paddingx, gameState.paddingy, MAX_X);

        gameRenderer.drawScore(gameState.score, 1225, 1425);

        //draw life platforms
        for(let i = 0; i < gameState.remainingPlatforms - 1; i += 1){
         gameRenderer.drawPlatform(Platform(1225, 75 + i * 50, 250, 30));
        }

        if(gameState.hasOwnProperty('countdown')){
            gameRenderer.drawCountdown(gameState.countdown);
        }
    }

    function exitGame(elapsedTime){
        gameState.continueGame = false;
        Menu.showScreen('main-menu');
    }


    let initialize = function(){

        rebuildGame();

        Keyboard.registerCommand(KeyEvent.DOM_VK_A, moveLeft);
        Keyboard.registerCommand(KeyEvent.DOM_VK_D, moveRight);
        Keyboard.registerCommand(KeyEvent.DOM_VK_ESCAPE, exitGame);
    };

    let run = function(){
        prevTime = performance.now();
        gameState.continueGame = true;

        requestAnimationFrame(gameLoop);

    };

    function gameLoop(time){
        let elapsedTime = time - prevTime;
        prevTime = time;

        handleInput(elapsedTime);
        update(elapsedTime);
        render(elapsedTime);

        if(gameState.continueGame) requestAnimationFrame(gameLoop);
    }

    return {
        gameState: gameState,
        rebuildGame: rebuildGame,
        run : run,
        initialize : initialize
    };

}(GameGraphics)); //ADD INPUT

Menu.screens['breakout'] = breakout;