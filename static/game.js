console.log("starting");

  // Get the modal
var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Canvas setup

var ball_speed = 0;

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var ballRadius = 10;
var x = canvas.width/2;
var y = canvas.height-30;
var dx = 2;
var dy = -2;

var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width-paddleWidth)/2;

var rightPressed = false;
var leftPressed = false;

// var brickRowCount = 5;
// var brickColumnCount = 3;

var brickRowCount = 10;
var brickColumnCount = 5;

// canvas size 480x320

var brickWidth = 35;
var brickHeight = 10;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 20;

var score = 0;
var lives = 3;
var bricks = [];
var game_in_progress = true;
var progress = document.getElementById("game_progress");
var stat = document.getElementById("game_stat");
var redrawIntervalID;

for(c=0; c<brickColumnCount; c++) {

    bricks[c] = [];
    for(r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 3 };
    }
}

// Canvas setup
function init() {
  ballRadius = 10;
  x = canvas.width/2;
  y = canvas.height-30;
  dx = 2;
  dy = -2;
  paddleHeight = 10;
  paddleWidth = 75;
  paddleX = (canvas.width-paddleWidth)/2;
  rightPressed = false;
  leftPressed = false;
  brickRowCount = 5;
  brickColumnCount = 3;

  brickWidth = 75;
  brickHeight = 20;
  brickPadding = 10;
  
  brickOffsetTop = 30;
  brickOffsetLeft = 30;
  
  score = 0;
  lives = 3;
  bricks = [];
  game_in_progress = true;

  for(c=0; c<brickColumnCount; c++) {
      bricks[c] = [];
      for(r=0; r<brickRowCount; r++) {
          bricks[c][r] = { x: 0, y: 0, status: 3 };
      }
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
}
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}
function collisionDetection() {
    for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.status > 0) {
                if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    b.status --;
                    if (b.status === 0) {
                      score++;
                      ball_speed ++;
                      x *= ball_speed;
                      y *= ball_speed;
                      if(score == brickRowCount*brickColumnCount) {
                        progress.innerHTML = "YOU WIN";
                        stop_game("win");
                      }
                    }
                 dy = -dy;
                }
            }
        }
    }
}
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}
function drawBricks() {
    for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
            var brickWeight = bricks[c][r].status;
            if(brickWeight > 0) {
                var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
                var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                // var img=document.getElementById("brick_img");
                // ctx.drawImage(img, brickX, brickY);
                if (brickWeight === 1) {
                  ctx.fillStyle = "#DC143C";
                  } else if (brickWeight === 2) {
                    ctx.fillStyle = "#8A2BE2";
                  }
                    else if (brickWeight === 3) {
                    ctx.fillStyle = "#006400";
                  }
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 8, 20);
}
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}
function draw() {
  console.log("starting to draw game");
  if(game_in_progress === true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();
    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if(y + dy < ballRadius) {
        dy = -dy;
    }
    else if(y + dy > canvas.height-ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        }
        else {
            lives--;
            if(!lives) {
                progress.innerHTML = "GAME OVER";
                stop_game("over");
            }
            else {
                x = canvas.width/2;
                y = canvas.height-30;
                dx = 3;
                dy = -3;
                paddleX = (canvas.width-paddleWidth)/2;
            }
        }
    }
    if(rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += 7;
    }
    else if(leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
    x += dx;
    y += dy;

    // requestAnimationFrame(draw); // infinite recursion kills browsers
    // way out - setInterval(draw, 25);
  }
  else {
    clearInterval(redrawIntervalID);
    redrawIntervalID = undefined;
  }
}

play = document.getElementById("play-game");

// switch between play/pause/resume while playing  
play.addEventListener("click", function () {
  if (play.value === "Play"){
    if (progress.innerHTML == "GAME STOPPED") {
      init();
    }
    progress.innerHTML = "";
    game_in_progress = true;
    redrawIntervalID = setInterval(draw, 25);
    play.value = 'Pause';
  }
  else if(play.value === 'Pause') {
    game_in_progress = false;
    progress.innerHTML = "GAME PAUSED";
    play.value = 'Resume';
  }
  else if(play.value === "Resume"){
    if (progress.innerHTML == "GAME STOPPED") {
      init();
    }
    progress.innerHTML = "";
    game_in_progress = true;
    redrawIntervalID = setInterval(draw, 25);
    play.value = 'Pause';
  }
});

stop = document.getElementById("stop-game");
stop.addEventListener("click", stop_game);

// save game state into db and back to default play button
function stop_game(msg){

    console.log("msg is " + msg);
  
    stat.innerHTML = "x=" + x + ", y=" + y + ", dx=" + dx + ", dy=" +  dy;
    game_in_progress = false;
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    progress.innerHTML = "GAME STOPPED";
    play.value = "Play";
}
 


