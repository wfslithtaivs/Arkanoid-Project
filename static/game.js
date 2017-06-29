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
var brickRowCount = 5;
var brickColumnCount = 3;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var score = 0;
var lives = 3;
var bricks = [];
var game_in_progress = true;
var progress = document.getElementById("game_progress");
var stat = document.getElementById("game_stat");

for(c=0; c<brickColumnCount; c++) {

    bricks[c] = [];
    for(r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
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
          bricks[c][r] = { x: 0, y: 0, status: 1 };
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
            if(b.status == 1) {
                if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if(score == brickRowCount*brickColumnCount) {
                      progress.innerHTML = "YOU WIN";
                      stop_game();
                    }
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
            if(bricks[c][r].status == 1) {
                var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
                var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                var img=document.getElementById("brick_img");
                ctx.drawImage(img, brickX, brickY);

                // ctx.rect(brickX, brickY, brickWidth, brickHeight);

                // ctx.fillStyle = "#0095DD";
                // ctx.fill();
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
    if(game_in_progress == true) {
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
                  // document.location.reload();
                  return;
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
}

// disable play button when game in progress and doesn;t stopped
// change pause at resume and let to push it to resume game
// enable save game only when paused

play = document.getElementById("play-game");
play.addEventListener("click", function () {
  console.log("play button clicked");
  if (progress.innerHTML == "GAME STOPPED") {
    init();
  }
  progress.innerHTML = "";
  game_in_progress = true;
  setInterval(draw, 25);
});
 
function stop_game(){
    stat.innerHTML = "x=" + x + ", y=" + y + ", dx=" + dx + ", dy=" +  dy;

    game_in_progress = false;

    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    progress.innerHTML = "GAME STOPPED";
}
 
stop = document.getElementById("stop-game");
stop.addEventListener("click", stop_game);


function pause_game(env){
    game_in_progress = false;

    progress.innerHTML = "GAME PAUSED";
}

pause = document.getElementById("pause-game");
pause.addEventListener("click", pause_game);

