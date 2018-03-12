var renderer = function(graphics){

    //draw bricks
    function drawBricks(bricks){
        for(let i = 0; i < bricks.length; i += 1){
            for(let j = 0; j < bricks[i].length; j +=1) {
                let brick = bricks[i][j];
                graphics.context.fillStyle = brick.color;
                graphics.context.fillRect(brick.x, brick.y, brick.width, brick.height);
                graphics.context.strokeStyle = 'rgb(0, 0, 0)';
                graphics.context.strokeRect(brick.x, brick.y, brick.width, brick.height);
            }
        }
    }

    //draw platform
    function drawPlatform(platform){
        graphics.context.strokeStyle = 'rgb(0,0,0)';
        graphics.context.strokeRect(platform.x, platform.y, platform.width, platform.height);
        graphics.context.fillStyle = 'rgb(100, 100, 100)';
        graphics.context.fillRect(platform.x, platform.y, platform.width, platform.height);

        graphics.context.fillStyle = 'rgb(20, 255, 20)';
        graphics.context.fillRect(platform.x, platform.y + 5, platform.width / 3, platform.height - 10);
        graphics.context.fillRect(platform.x + 2*(platform.width/3), platform.y + 5, platform.width / 3, platform.height - 10);
    }

    //draw background
    function drawBackground(image, imageSpec){
        graphics.context.drawImage(image, 0, 0, graphics.canvas.width, graphics.canvas.height);

    }

    //draw balls
    function drawBalls(balls){
        graphics.context.fillStyle = 'rgb(50, 150, 250)';

        for(let i = 0; i < balls.length; i +=1){
            graphics.context.beginPath();
            graphics.context.arc(balls[i].x, balls[i].y, balls[i].radius, 0, 2*Math.PI);
            graphics.context.fill();
            graphics.context.closePath();

        }
    }

    function drawCountdown(countdown){
        graphics.context.fillStyle = 'rgb(150, 255, 255)';
        graphics.context.font = '90px Arial';
        graphics.context.fillText((Math.floor(countdown / 1000) + 1), 550, 700);
    }

    //draw walls
    function drawWalls(paddingx, paddingy, MAX_X){
        graphics.context.strokeStyle = 'rgb(0, 0, 0)';
        graphics.context.fillStyle = 'rgb(192, 192, 192)';

        //draw left
        graphics.context.fillRect(0, 0, paddingx, graphics.canvas.height - 5);
        graphics.context.strokeRect(0, 0, paddingx, graphics.canvas.height - 5);
        //draw right
        graphics.context.fillRect(MAX_X - paddingx, 0, paddingx, graphics.canvas.height - 5);
        graphics.context.strokeRect(MAX_X - paddingx, 0, paddingx, graphics.canvas.height - 5);

        //draw top
        graphics.context.fillRect(paddingx, 0, MAX_X - (paddingx * 2), paddingy);
        graphics.context.strokeRect(paddingx, 0, MAX_X - (paddingx * 2), paddingy);
    }

    function drawScore(score, x, y){
        graphics.context.fillStyle = 'rgb(150, 150, 255)';
        graphics.context.font = '50px Arial';
        graphics.context.fillText("Score: " + score, x, y);
    }

    //draw particles
    function drawParticles(particles){
        graphics.context.fillStyle = 'rgb(230, 230, 230)';

        for(let i = 0; i < particles.length; i += 1){
            let particle = particles[i];

            graphics.context.save();

            graphics.context.translate(particle.x + particle.size / 2, particle.y + particle.size / 2);
            graphics.context.rotate(particle.rotation);
            graphics.context.translate(-(particle.x + particle.size / 2), -(particle.y + particle.size/2));

            graphics.context.fillRect(particle.x, particle.y, particle.size, particle.size);

            graphics.context.restore();
        }
    }

    //clear
    function clear(){
        graphics.context.save();
        graphics.context.setTransform(1, 0, 0, 1, 0, 0);
        graphics.context.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
        graphics.context.restore();
    }

    return {
        drawCountdown: drawCountdown,
        drawParticles: drawParticles,
        drawScore: drawScore,
        drawWalls: drawWalls,
        drawBricks: drawBricks,
        drawPlatform: drawPlatform,
        drawBackground: drawBackground,
        drawBalls: drawBalls,
        clear: clear
    }

}(GameGraphics);