const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const socket = io('/pong'); 

let isReferee = false;
let paddleIndex = 0;

let width = 500;
let height = 700;

//paddle
let paddleHeight = 10;
let paddleWidth = 50;
let paddleDiff = 25;
let paddleX = [225, 225];
let trajectoryX = [0, 0];
let playerMoved = false;

//ball
let ballX = 250;
let ballY = 350;
let ballRadius = 5;
let ballDirection = 1;

//Speed
let speedY = 2;
let speedX = 1;
// let computerSpeed = 4;

// score for Both Players
let score = [0, 0];

//Create canvas element
function createCanvas() {
  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  renderCanvas();
}

// wait for Opponents
function renderIntro(){
    // canvas background
    context.fillStyle = 'black';
    context.fillRect(0,0,width,height);

    //IntroText
    context.fillStyle= 'white';
    context.font = "32px Courier New";
    context.fillText('Waiting for opponent...', 20,(canvas.height/2)-30);
}

//render Everything on canvas
function renderCanvas() {
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  //paddle color
  context.fillStyle = "white";

  //botton paddle
  context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

  //top paddle
  context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

  //Dashed Center Line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = "grey";
  context.stroke();

  //Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = "white";
  context.fill();

  //score
  context.font = "32px Courier New";
  context.fillText(score[0], 20, canvas.height / 2 + 50);
  context.fillText(score[1], 20, canvas.height / 2 + 30);
}

//reset ball to center
function ballReset() {
  ballX = width / 2;
  ballY =( height / 2 );
  speedY = 3;

  socket.emit("ballMove", {
    ballX,
    ballY,
    score,
  });

}

function ballMove() {
  //vertical Speed
  ballY += speedY * ballDirection;
  
  //Horizontal Speed
  if (playerMoved) {
    ballX += speedX;
  }

  socket.emit('ballMove',{
    ballX,
    ballY,
    score,
  });
}

//Determin what Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
    
  //Bound off walls 
  if ((ballX < 0 && speedX < 0) || (ballX > width && speedX > 0)) {
    speedX = -speedX;
  }

  //Bounce off Player paddle (bottom)
  if (ballY > height - paddleDiff) {

    if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
      //Add speed on hit
      if (playerMoved) {
        speedY += 1;
        //Max speed
        if (speedY > 5) {
          speedY = 5;
        }
      }

      ballDirection = -ballDirection;
      trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
      speedX = trajectoryX[0] * 0.3;
    } else {
      //Reset Ball, add to computer score
      ballReset();
      score[1]++;
    }
  }

  //Bounce off Computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
      //Add speed on hit
      if (playerMoved) {
        speedY += 1;
        //max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
      speedX = trajectoryX[1] * 0.3;
    } else {
      //Reset Ball, Increase Computer Difficulty, add to player score
    //   if (computerSpeed < 6) {
    //     computerSpeed += 0.5;
    // }
        ballReset();
        score[0]++;
    }
  }
}

//compurte movement
// function computerAI() {
//   if (playerMoved) {
//     if (paddleX[1] + paddleDiff < ballX) {
//       paddleX[1] += computerSpeed;
//     } else {
//       paddleX[1] -= computerSpeed;
//     }

//     if (paddleX[1] < 0) {
//       paddleX[1] = 0;
//     } else if (paddleX[1] > width - paddleWidth) {
//       paddleX[1] = width - paddleWidth;
//     }
//   }
// }

//Called Every Frame
function animate() {
    if(isReferee){
        ballMove();
        ballBoundaries();
    }
//   computerAI();
  renderCanvas();
  window.requestAnimationFrame(animate);
}

//load Game, Reset Everything
function loadGame() {
  createCanvas();
  renderIntro();
  socket.emit('ready');
}

//start Game, Reset Everything
function startGame() {
  paddleIndex = isReferee? 0 : 1;
  window.requestAnimationFrame(animate);
  canvas.addEventListener("mousemove", (e) => {
    playerMoved = true;
    paddleX[paddleIndex] = e.offsetX;
    if (paddleX[paddleIndex] < 0) {
      paddleX[paddleIndex] = 0;
    }

    if (paddleX[paddleIndex] > width - paddleWidth) {
      paddleX[paddleIndex] = width - paddleWidth;
    }
    //emit player position
    socket.emit("paddleMove", {
      xPosition: paddleX[paddleIndex],
    });

    //Hide Cursor
    canvas.style.cursor = "none";
  });
}

//on Load
loadGame();
socket.on('connect',()=>{
    console.log(socket.id)
})

socket.on('startGame',(refereeId)=>{
    console.log('referee is ', refereeId);

    isReferee = socket.id === refereeId;
    startGame()
});

socket.on('paddleMove',(paddleData)=>{
    //toggle 0 and 1
    let opponentPaddleIndex = 1 - paddleIndex;
    paddleX[opponentPaddleIndex]=paddleData.xPosition;
});

socket.on("ballMove", (ballData) => {
    ballX = ballData.ballX;
    ballY = ballData.ballY;
    score = ballData.score;
});