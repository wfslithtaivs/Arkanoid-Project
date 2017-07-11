// Canvas setup, size 480x320 
var canvas = document.getElementById("myCanvas");
var play_button = document.getElementById("play-game");
var save_button = document.getElementById("save-game");
var elem = document.getElementById("myProgress"); 
var msg_field = document.getElementById("msg");
var progress = 1;
var ctx = canvas.getContext("2d");
var x = this.canvas.width/2;
var y = this.canvas.height - 30;
var dx = 4;
var dy = -4;
var redrawIntervalID;

//------- Keyboard and Mouse Handlers 
        
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("mousemove", mouseMoveHandler, false);

    var rightPressed = false;
    var leftPressed = false;
    
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
            paddle.x = relativeX - paddle.pWidth/2;
        }
    }

//---- Paddle class
    function Paddle(cWidth) {
        this.pHeight = 10;
        this.pWidth = 75;
        this.x = (cWidth-this.pWidth)/2;
    }
    
    Paddle.prototype.draw = function(){
        ctx.rect(this.x, canvas.height - this.pHeight, this.pWidth, this.pHeight);
    }

//------Ball class
    function Ball() {
    }
    
    Ball.speed = 0;
    Ball.radius = 10;
    
    Ball.prototype.draw = function(){
        ctx.arc(x, y, Ball.radius, 0, Math.PI*2)
    }
    
// -------------------------------------
    
    var paddle = new Paddle(canvas.width);
    var ball = new Ball();
    

//----- Brick class
    function Brick(x, y, weight) {    
        this.x = x || 0;
        this.y = y || 0;
        this.bWeight = weight || 3;
    }   
    
    Brick.bWidth = 75;
    Brick.bHeight = 20;
    Brick.bPadding = 10;
    Brick.bOffsetTop = 30;
    Brick.bOffsetLeft = 30;
    
    Brick.prototype.draw = function(){
        ctx.beginPath();
        if (this.bWeight === 1) {
                  ctx.fillStyle = "#DC143C";
                  } else if (this.bWeight === 2) {
                    ctx.fillStyle = "#8A2BE2";
                  }
                    else if (this.bWeight === 3) {
                    ctx.fillStyle = "#0095DD";
                  }
        else if (this.bWeight <= 0) {
            return;
        }
        ctx.rect(this.x, this.y, Brick.bWidth, Brick.bHeight);
        ctx.fill();
        ctx.closePath();
    }
    
// ----- Game class
    function Game() {
        this.gameParams = {score : 0, 
                            lives: 3,
                            game_in_progress: true,
                            bricks_collected: 0};
        this.bricks = [];
    }
    
    Game.brickRowCount = 5;
    Game.brickColumnCount = 3;
    Game.numBricks = 15;

    init_bricks = function() {
        var bricks = [];
        for(var r = 0; r < Game.brickRowCount; r++) {
            bricks[r] = [];
            for(var c = 0; c < Game.brickColumnCount; c++){            
                var bx = (r*(Brick.bWidth+Brick.bPadding))+Brick.bOffsetLeft;
                var by = (c*(Brick.bHeight+Brick.bPadding))+Brick.bOffsetTop;
                var bweight = Math.floor(Math.random() * 3)+ 1;
                bricks[r][c] = new Brick(bx, by, bweight);
            }
        }
        return bricks;
    }
    
    Game.prototype.init = function(params = false) {
    
        this.gameParams = {score : 0, 
                    lives: 3,
                    game_in_progress: true,
                    bricks_collected: 0};

        if (params) {        
            x = params["x"];
            y = params["y"];
            dx = params["dx"];
            dy = params["dy"];
            this.bricks = params["bricks"];
        } else {
            x = canvas.width/2;
            y =  canvas.height/2;
            dx = 2;
            dy = -2;
            this.bricks = init_bricks();
            
        }
    }
    
    Game.prototype.collision_detection = function() {
            for(var c = 0; c < Game.brickRowCount; c++) {
                for(var r = 0; r < Game.brickColumnCount; r++) {
                var b = this.bricks[c][r];
                
                if(b.bWeight > 0) {
                    if(x > b.x && x < b.x + Brick.bWidth && 
                        y > b.y && y < b.y + Brick.bHeight) {
     
                            b.bWeight --;
                            dy = -dy;
                            this.gameParams.score++;
                        
                            if (b.bWeight === 0) {

                                this.gameParams.bricks_collected++;
                                
                                dx > 0 ? dx += 0.5 : dx -= 0.5;
                                dy > 0 ? dy += 0.5 : dy -= 0.5;
                                
                                progress = (this.gameParams.bricks_collected / Game.numBricks) * 100 ; 
                                elem.style.width = progress + '%'; 
                                
                                if(this.gameParams.bricks_collected == Game.numBricks){
                                    save_game(game, 'won');
                                    this.stop_game();
                                }
                            }
                        }
                    }
                }
            }
    }
        
    Game.prototype.stop_game = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        clearInterval(redrawIntervalID);
        redrawIntervalID = undefined;
        play_button.innerHTML = 'Play';
        save_button.setAttribute("style", "display:none;");

        var greet_user = Math.floor(progress);

        if (greet_user == 100) {
            greet_user = "Congrats with completing " + greet_user + "% of a game. With a score " + this.gameParams.score + ".";
        }
        else {
            greet_user = "You finished " + greet_user + "% of a game. Keep playing!";
        }

        msg_field.innerHTML = greet_user;
        this.init();
    }
    
    play = function(game, paddle, ball){
        
        if (game.gameParams.game_in_progress){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ball.draw();
                paddle.draw();       
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                
                for(var r = 0; r < Game.brickRowCount; r++) {
                    for(var c = 0; c < Game.brickColumnCount; c++){
                        game.bricks[r][c].draw();
                    }
                }
                
                drawScore(game.gameParams.score);
                drawLives(game.gameParams.lives);
                game.collision_detection();
        
                if(rightPressed && paddle.x < canvas.width - paddle.pWidth) {
                    paddle.x += 7;
                }
                else if(leftPressed && paddle.x > 0) {
                    paddle.x -= 7;
                }
                                
                if(x + dx > canvas.width - Ball.radius || x + dx < Ball.radius) {
                    dx = -dx;
                }
                
                if(y + dy < Ball.radius) {
                    dy = -dy;
                }
                
                if(y + dy > canvas.height-Ball.radius) {
                
                    if(x > paddle.x && x < paddle.x + paddle.pWidth) {
                        dy = -dy;
                    }
                    
                    else {
                        game.gameParams.lives--;
                        if(!game.gameParams.lives) {
                            save_game(game, 'loose');
                            game.stop_game();
                        }
                        else {
                            x = canvas.width/2;
                            y = canvas.height-30;
                            dx = 3;
                            dy = -3;
                            paddle.x = (canvas.width-paddle.pWidth)/2;
                        }
                    }
                }
                x += dx,
                y += dy;
                    
            }
            else {
                game.stop_game();
            }
    }
    
// ---- Game state display    
    function drawScore(score) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Score: "+score, 8, 20);
    }
    
    function drawLives(lives) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Lives: "+lives, canvas.width-65, 20);
    }
// ------- Instances and callbacks
    
    var game = new Game();
    game.init();
    console.log(game);
    
    play_button.addEventListener("click", function (){
           if(play_button.innerHTML === "Play") {
                msg_field.innerHTML = "";
                redrawIntervalID = setInterval(function () { play(game, paddle, ball); }, 20);
                play_button.innerHTML = 'Pause';
                save_button.setAttribute("style", "width:auto; display:none;");
           } 
           else if(play_button.innerHTML === "Pause") {
                clearInterval(redrawIntervalID);
                redrawIntervalID = undefined;
                play_button.innerHTML = 'Play';
                save_button.setAttribute("style", "width:auto; display:block;");
           }
    });

    save_button.addEventListener("click", function () { save_game(game, 'saved');} );

    function save_game(game, msg) {
        var saved_game_id;

        game_stat = {'x':x,
                     'y': y,
                     'dx':dx,
                     'dy':dy,
                     'bricks': game.bricks,
                     'score': game.gameParams.score,
                     'lives': game.gameParams.lives,
                     'bricks_collected' : game.gameParams.bricks_collected,
                     'status': msg
                 };

        console.log(JSON.stringify(game_stat));

      $.post("/log_game",
              JSON.stringify(game_stat),
              function (results){
                msg_field.innerHTML = msg_field.innerHTML + "\n" + "GAME SAVED with id=" + results.game_id;
      });
    }

    
 



