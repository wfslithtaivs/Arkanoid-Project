// Canvas setup, size 480x320

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ball_speed = 0;
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
var numBricks = brickRowCount * brickColumnCount;
var redrawIntervalID;
var msg = "";

var progress = document.getElementById("game_progress");
var stat = document.getElementById("game_stat");

// Canvas setup
function init(params) {
  //init(params = {"x" : 3, "y" : 5, "dx" : -40, "dy" : 7, "bricks" : [1, 2, 3]});

  x = params["x"] || canvas.width/2;
  y = params["y"] || canvas.height/2;
  dx = params["dx"] || 2;
  dy = params["dy"] || -2;
  bricks = params["bricks"] || [];

  console.log(x, y, dx, dy, bricks);
  console.log(params);
  console.log(params["x"], params["y"], params["dx"], params["dy"], bricks);

  ballRadius = 10;
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
  game_in_progress = true;

  if (bricks.length === 0) {
    for(c=0; c<brickColumnCount; c++) {
        bricks[c] = [];
        for(r=0; r<brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 3 };
        }
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
                    dy = -dy;

                    if (b.status === 0) {
                      score++;
                      ball_speed ++;
                      x *= ball_speed;
                      y *= ball_speed;
                      
                      if(score == numBricks){
                        progress.innerHTML = "YOU WIN";
                        msg = "won";
                        stop_game();
                      }
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
    collisionDetection(); // TODO: how to make sure that collisions detected one at a time?
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
                msg = "over";
                stop_game();
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
    // load parameters to initialize game from sessions

    var data = JSON.parse($("div#saved_game").text());
  
    if (data) {
      console.log("initialized with data");
      init(params = data);
    }
    else {
      console.log("initialized from scratch");
      init(params = false);
    }

    progress.innerHTML = "";
    game_in_progress = true;
    redrawIntervalID = setInterval(draw, 25);
    play.value = 'Pause';
  }
  else if(play.value === 'Pause') {
    msg = "paused";
    stop_game();
    progress.innerHTML = "GAME PAUSED";
    play.value = 'Resume';
  }
  else if(play.value === "Resume"){
    // load current game from corresponding json
    
    $.get("/get_game.json", function (results){
            console.log(results);
          });
    
    init(params = false);
    game_in_progress = true;
    redrawIntervalID = setInterval(draw, 25);
    play.value = "Pause";
  }
});

stop = document.getElementById("stop-game");
stop.addEventListener("click", stop_game);

// save game state into db and back to default play button
function stop_game(){
  game_in_progress = false;
  console.log("msg is " + msg);
  play.value = "Play";
  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
 
save = document.getElementById("save-game");
save.addEventListener("click", save_game);

function save_game() {
  var saved_game_id;

  game_stat = {'x':x,
              'y': y,
              'dx':dx,
              'dy':dy,
              'bricks': bricks,
              'score': score,
              'status': msg
             };

  console.log(JSON.stringify(game_stat));

  $.post("/log_game",
          JSON.stringify(game_stat),
          function (results){
            progress.innerHTML = "GAME SAVED with id=" + results.game_id;
  });
}
