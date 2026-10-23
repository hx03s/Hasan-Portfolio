document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const width = 10;
    let nextRandom = 0;
    let timerId;
    let score = 0;
    let timeLeft = 180; // 3 minutes in seconds
    let timerInterval;
    const timerDisplay = document.querySelector('#timer');
    let isPaused = true;
    const restartBtn = document.querySelector('#restart-button');
    let lives = 3;
    const livesDisplay = document.querySelector('#lives'); 
    let gameCount = 0; // Counter for games played
    let cumulativeScore = 0; // Total score across three games

    updateLivesDisplay();

    const colors = [
        'orange',
        'red',
        'purple',
        'green',
        'blue'
    ];

    // Tetrominoes
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;

    console.log(theTetrominoes[0][0]);

    // Randomly select a Tetromino and its first rotation
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    // Draw the Tetromino
    function draw() {
        current.forEach(index => {
            if (squares[currentPosition + index]) {
                squares[currentPosition + index].classList.add('tetromino');
                squares[currentPosition + index].style.backgroundColor = colors[random];
            }
        });
    }      // Undraw the Tetromino
      function undraw() {
          current.forEach(index => {
              if (squares[currentPosition + index]) {
                  squares[currentPosition + index].classList.remove('tetromino');
                  squares[currentPosition + index].style.backgroundColor = '';
              }
          });
      }
    // Assign functions to keyCodes
    function control(e) {
        if (timerId) {
            if (e.keyCode === 37) {
                moveLeft();
            } else if (e.keyCode === 38) {
                rotate();
            } else if (e.keyCode === 39) {
                moveRight();
            } else if (e.keyCode === 40) {
                moveDown();
            }
        }
    }

    document.addEventListener('keyup', control);

    // Move down function
    function moveDown() {
        if (!timerId) return;
        undraw();
        if (current.every(index => currentPosition + index + width < 200)) {
            currentPosition += width;
        }
        draw();
        freeze();
    }
      // Freeze function
      function freeze() {
          if (current.some(index => {
              const nextPosition = currentPosition + index + width;
              return nextPosition >= 200 || (squares[nextPosition] && squares[nextPosition].classList.contains('taken'));
          })) {
              current.forEach(index => {
                  if (squares[currentPosition + index]) {
                      squares[currentPosition + index].classList.add('taken');
                  }
              });
              random = nextRandom;
              nextRandom = Math.floor(Math.random() * theTetrominoes.length);
              current = theTetrominoes[random][currentRotation];
              currentPosition = 4;
              draw();
              displayShape();
              addScore();
              gameOver();
          }
      }
    // Move the Tetromino left, unless it is at the edge or there is a blockage
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    // Move the Tetromino right, unless it is at the edge or there is a blockage
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    // Fix rotation of Tetrominos at the edge
    function isAtRight() {
        return current.some(index => (currentPosition + index + 1) % width === 0);
    }

    function isAtLeft() {
        return current.some(index => (currentPosition + index) % width === 0);
    }

    function checkRotatedPosition(P) {
        P = P || currentPosition; // Get current position. Then, check if the piece is near the left side.
        if ((P + 1) % width < 4) { // Add 1 because the position index can be 1 less than where the piece is (with how they are indexed).
            if (isAtRight()) { // Use actual position to check if it's flipped over to right side
                currentPosition += 1; // If so, add one to wrap it back around
                checkRotatedPosition(P); // Check again. Pass position from start, since long block might need to move more.
            }
        } else if (P % width > 5) {
            if (isAtLeft()) {
                currentPosition -= 1;
                checkRotatedPosition(P);
            }
        }
    }

    // Rotate the Tetromino
    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) { // If the current rotation gets to 4, make it go back to 0
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        checkRotatedPosition();
        draw();
    }

    // Show up-next Tetromino in mini-grid display
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    const displayIndex = 0;

    // The Tetrominos without rotations
    const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], // lTetromino
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], // zTetromino
        [1, displayWidth, displayWidth + 1, displayWidth + 2], // tTetromino
        [0, 1, displayWidth, displayWidth + 1], // oTetromino
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] // iTetromino
    ];

    // Display the shape in the mini-grid display
    function displayShape() {
        // Remove any trace of a Tetromino from the entire grid
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        });
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
        });
    }

    // Add functionality to the button
    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            clearInterval(timerInterval);
            timerId = null;
            isPaused = true;
        } else {
            // Start the game
            draw();
            timerId = setInterval(moveDown, 1000);
            timerInterval = setInterval(countdown, 1000); // start the countdown timer
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            displayShape();
            isPaused = false;
        }
    });

    // Countdown timer function
    function countdown() {
        if (!isPaused) {
            timeLeft--;
            timerDisplay.textContent = `Time left: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                gameOver();
            }
        }
    }

// Add score function
function addScore() {
    for (let i = 0; i < 199; i += width) {
        const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
        if (row.every(index => squares[index].classList.contains('taken'))) {
            score += 10;
            cumulativeScore += 10; // Update cumulative score when points are added
            scoreDisplay.innerHTML = cumulativeScore;
            row.forEach(index => {
                squares[index].classList.remove('taken');
                squares[index].classList.remove('tetromino');
                squares[index].style.backgroundColor = '';
            });
            const squaresRemoved = squares.splice(i, width);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid.appendChild(cell));
        }
    }
}

// Game over function
function gameOver() {
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        clearInterval(timerId);
        clearInterval(timerInterval);
        timerId = null;
        timerInterval = null;
        removeLife();  // Decrement lives

        if (lives <= 0 || gameCount >= 3) {
            alert(`Game Over! You lost. Final Score: ${cumulativeScore}`);
            restartGame(true); // Reset everything for a fresh start
        } else {
            alert(`Round over! You have ${lives} lives left. Current total score: ${cumulativeScore}`);
            restartCurrentGame();  // Continue the game if there are remaining lives
        }
    }
}



// Restart the game completely after 3 rounds or if lives are 0
function restartGame(isGameOver = false) {
    clearInterval(timerId);
    clearInterval(timerInterval);

    squares.forEach(square => {
        square.classList.remove('tetromino', 'taken');
        square.style.backgroundColor = '';
    });

    currentPosition = 4;
    currentRotation = 0;
    random = Math.floor(Math.random() * theTetrominoes.length);
    current = theTetrominoes[random][currentRotation];
    nextRandom = Math.floor(Math.random() * theTetrominoes.length);

    if (isGameOver) {
        score = 0;
        cumulativeScore = 0; // Reset total score
        gameCount = 0;
        lives = 3; // Reset lives
    }

    scoreDisplay.innerHTML = cumulativeScore; // Display cumulative score
    timerDisplay.textContent = `Time left: ${timeLeft}s`;
    updateLivesDisplay();
    
    squares = Array.from(document.querySelectorAll('.grid div'));

    draw();
    timerId = setInterval(moveDown, 1000);
    timerInterval = setInterval(countdown, 1000);
}


    // Restart the current game without resetting the total score or game count
function restartCurrentGame() {
    clearInterval(timerId);
    clearInterval(timerInterval);
    squares.forEach(square => {
        square.classList.remove('tetromino', 'taken');
        square.style.backgroundColor = '';
    });
    
    // Reset the grid
    squares = Array.from(document.querySelectorAll('.grid div'));
    
    currentPosition = 4;
    currentRotation = 0;
    random = Math.floor(Math.random() * theTetrominoes.length);
    current = theTetrominoes[random][currentRotation];
    nextRandom = Math.floor(Math.random() * theTetrominoes.length);
    
    // Score reset is not needed here since we're just continuing
    score = 0;  // Reset only the round score
    scoreDisplay.innerHTML = cumulativeScore;  // Display cumulative score
    
    timeLeft = 180;
    timerDisplay.textContent = `Time left: ${timeLeft}s`;
    updateLivesDisplay();
    draw();
    timerId = setInterval(moveDown, 1000);
    timerInterval = setInterval(countdown, 1000);
}

    // Restart button functionality
    restartBtn.addEventListener('click', () => {
        restartGame(true); // Restart game completely when restart button is clicked
    });
    

    // Update lives display function
    function updateLivesDisplay() {
        livesDisplay.textContent = '❤'.repeat(lives);
    }

// Remove life function
function removeLife() {
    lives--;
    updateLivesDisplay();

    if (lives <= 0) {
        gameOver(); // Trigger game over when no lives are left
    }
}

});
