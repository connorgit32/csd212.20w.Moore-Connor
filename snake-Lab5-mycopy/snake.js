(function() {
    "use strict"

    const BLOCK_SIZE = 50                // Number of pixels per gameboard grid block
    const INITIAL_SPEED = 5              // In grid blocks/sec
    const INITIAL_SNAKE_DIRECTION = 'R'  // One of R, L, U, or D

    let gameState                        // Either 'running' or 'over'

    let boardEl,                         // The gameboard element
        foodEl,                          // The food element
        gameoverEl,                      // The gameover element

        snakeX,                          // The snake's coordinates in terms of the gameboard grid
        snakeY,
        snakeDirection,
        snakeSpeed,
        snakeEl,                         // The snake element
        snakeColor = "#721745"

    let boardW,                          // The gameboard's size in terms of the gameboard grid
        boardH,
        score

    /**
     * Returns the number of pixels represented by a given size in gameboard blocks
     * @param sizeInBlocks The size to convert in terms of number of gameboard grid squares (blocks)
     * @param includeUnits Whether or not to include the 'px' unit in the returned value
     */
    function px(sizeInBlocks, includeUnits=true) {
        return  sizeInBlocks * BLOCK_SIZE + (includeUnits ? 'px' : '')
    }

    /**
     * Sizes the gameboard so that it takes up the maximum amount of space within the browser viewport
     * but has width and height dimensions that are multiples of the BLOCK_SIZE
     */
    function resizeBoard() {

        let w = window.innerWidth
        let h = window.innerHeight

        // Size the board so there is a left/right margin by subtracting 2 grid block sizes from the window width
        let boardPxW = w - px(2, false);
        // Size the board so there is a bottom margin by subtracting 1 grid block size from the window height
        // Also make room for the header element by removing its height (boardEl.offsetTop) from the window height
        let boardPxH = h - boardEl.offsetTop - px(1, false);

        // At this point boardPxW and boardPxH are the pixel maximum width and height dimensions of the board.
        // These two lines now round these values down so that the dimensions are multiples of BLOCK_SIZE
        // For example, BLOCK_SIZE=10, boardPxW=1234px, boardPxH=879
        // So we need boardPxW=1230px, boardPxH=870px
        boardPxW -= boardPxW % BLOCK_SIZE   // In the example, boardPxW % BLOCK_SIZE = 4
        boardPxH -= boardPxH % BLOCK_SIZE   // In the example, boardPxH % BLOCK_SIZE = 9

        boardEl.style.width = boardPxW + 'px'
        boardEl.style.height = boardPxH + 'px';

        boardEl.style.borderWidth = px(0.5);  // Give the gameboard a 1/2 BLOCK_SIZE border

        // boardW and boardH are the gameboard dimensions in terms of gameboard grid blocks
        // (We will use gameboard coordinates rather than pixel coordinates to keep track of the location
        // of various elements in our app)
        boardW = boardPxW / BLOCK_SIZE
        boardH = boardPxH / BLOCK_SIZE
    }

    /**
     * Place the given element at the correct pixel position for the given grid coordinates.
     * This function assumes that the given element has position:absolute and is positioned relative to #gameboard
     *
     * @param el The element to position on the gameboard grid
     * @param gridX The x-coordinate on the gameboard grid at which to position the segment
     * @param gridY The y-coordinate on the gameboard grid at which to position the segment
     */
    function positionElementOnGrid(el, gridX, gridY) {
        el.style.left = px(gridX);
        el.style.top = px(gridY);
    }

    /**
     * Returns true if the two given elements are in the same location
     */
    function isAtSamePos(el1, el2) {
        // determine if the two elements are at the same location
        if (el1.style.top == el2.style.top && el1.style.left == el2.style.left) {
            return true;
        }
        else {
            return false;
        }
    }

    function isSnakeOutOfBounds() {
        // handles right, left, top, bottom borders in that order
        if (snakeX > (boardW - 1)  || snakeX < 0 || snakeY < 0 || snakeY > (boardH - 1)){ // -1 from boardW/boardH to account for 1 block_size margin
            return true;
        } 
        else {
            return false;
            
        }
    }

    /**
     * Returns the milliseconds per tick needed if the snake is moving at the given speed
     * @param speed The number of gameboard grid blocks per second
     */
    function msPerTick(speed) {
        return 1000.0/speed;
    }

    /**
     * This is the main driver of game progression.  This function should be called once per 'tick' of the game.
     * The number of ticks per second are determined by snakeSpeed, and this speed can be converted into a millisecond
     * value using the msPerTick function above.
     */
    function tick() {
        // use a timer to update the game and re-call tick

           setTimeout(function(){
                if (gameState == 'running') {
                updateGame();
                tick();
                }
            }, msPerTick(snakeSpeed))
        }
    

    function createSnakeSegmentElement() {
        // create and return a snake segment element
        var snake = document.createElement("div");
        snake.classList.add("snake-segment");
        snake.style.backgroundColor = snakeColor;
        snake.style.width = px(1);
        snake.style.height = px(1);
        return snake;
    }

    function createFoodElement() {
        // create and return a food element
        var food = document.createElement("div");
        food.classList.add("food");
        food.style.width = px(1);
        food.style.height = px(1);
        food.style.borderRadius = "50%";
        food.style.backgroundColor = "green";
        return food;
    }

    function killSnake() {
        // set the snake's background color to transparent
        snakeEl.style.backgroundColor = "transparent";
    }

    function clearBoard() {
        // remove all elements from the gameboard element
        document.getElementById("gameboard").textContent = "";
        score = 0; // gives score a value
    }

    function hideMenu() {
        // hide the menu
        document.getElementById("menu").classList.remove("open");
    }

    function showMenu() {
        // show the menu
        document.getElementById("menu").classList.add("open");
    }

    function hideGameOver() {
        // hide the gameover element
        document.getElementById("game-over").classList.remove("show");
    }

    function showGameOver() {
        // show the gameover element
        document.getElementById("game-over").classList.add("show");
    }

    function initSnake() {
        snakeX = 0;
        snakeY = 0;
        
        snakeSpeed = INITIAL_SPEED;
        snakeDirection = INITIAL_SNAKE_DIRECTION;

        snakeEl = createSnakeSegmentElement();
        boardEl.appendChild(snakeEl);
        positionElementOnGrid(snakeEl, snakeX, snakeY);
    }

    function addNewFood() {
        let x = boardW; // so global variable doesn't change
        let y = boardH; 
        x -= 1; // accounts for 1 block size margin of gameboard
        y -= 1;

        foodEl = createFoodElement();
        boardEl.appendChild(foodEl);
        positionElementOnGrid(foodEl, x, y);
    }

    function updateScoreElement() {
        document.getElementById("score").innerHTML = score;
    }

    function updateSpeedElement() {
        document.getElementById("speed").innerHTML = snakeSpeed + " blocks/sec";
    }

    function updateSnakePosition() {
        
        if (snakeDirection == 'R') {
           snakeX += 1
        }
        if (snakeDirection == 'D') {
           snakeY += 1
        }
        if (snakeDirection == 'L') {
            snakeX -= 1
        }
        if (snakeDirection == 'U') {
            snakeY -= 1
        }
    }

    function isGameOver() {
        return isSnakeOutOfBounds()
    }

    function snakeFoundFood() {
        return isAtSamePos(snakeEl, foodEl)
    }

    function updateGame() {

        updateSnakePosition()

        if ( isGameOver() ) {
            showGameOver()
            killSnake()
            gameState = 'over'
        } else {
            positionElementOnGrid(snakeEl, snakeX, snakeY)

            if ( snakeFoundFood() ) {
                score += 10
                snakeSpeed *= 1.05
            }
            updateScoreElement()
            updateSpeedElement()
        }
    }

    function resetGame() {

        clearBoard()
        resizeBoard()

        // Needs to happen after the board has been cleared
        initSnake()
        addNewFood()

        
        hideGameOver();
    }

    function startGame() {

        gameState = 'running'
        tick()

    }

    function handleFormSubmit(event) {
        hideMenu()

        resetGame()
        startGame()

        // This prevents the form from actually submitting
        event.preventDefault()
    }

    function handleKeyPress(event) {
        // set snakeDirection according to the key the user pressed
        if (gameState == 'running') {
            if (event.key == "ArrowUp") {
                snakeDirection = "U";
            }
            if (event.key == "ArrowDown") {
                snakeDirection = "D";
            }
            if (event.key == "ArrowRight") {
                snakeDirection = "R";
            }
            if (event.key == "ArrowLeft") {
                snakeDirection = "L";
            }
        }
    }

    function init() {

        boardEl = document.getElementById("gameboard");
        gameoverEl = document.getElementById("game-over");
        var startBtn = document.getElementsByTagName("form")[0];

        gameoverEl.addEventListener("click", showMenu, false);

        startBtn.addEventListener("submit", handleFormSubmit, false);

    }


    window.addEventListener("load", init, false); // starts the whole program once page loads

    window.addEventListener("keydown", handleKeyPress, false); // runs handleKeyPress when a key is pushed down


})();