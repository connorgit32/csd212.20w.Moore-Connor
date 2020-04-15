"use strict"

const DEFAULT_BLOCK_SIZE = 50         // Number of pixels per gameboard grid square
const DEFAULT_SNAKE_COLOR = '#721745'
const INITIAL_SNAKE_SPEED = 5         // In grid blocks/sec

let blockSize = DEFAULT_BLOCK_SIZE

/**
 * Returns the milliseconds per tick needed if the snake is moving at the given blocks/sec speed
 * @param speed The number of gameboard grid blocks per second
 */
function msPerTick(speed) {
    return 1000.0/speed;
}

/**
 * Returns the number of pixels represented by a given size in gameboard blocks
 * @param sizeInBlocks The size to convert in terms of number of gameboard grid squares (blocks)
 * @param includeUnits Whether or not to include the 'px' unit in the returned value
 */
function px(sizeInBlocks, includeUnits=true) {
    const px = sizeInBlocks * blockSize
    if ( includeUnits ) { return px + 'px' }
    return px
}

/**
 * Represents a point on the game board grid
 */
class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    /**
     * Returns true if the give other point is at the same location as this point
     * @param otherPoint The other point with which to compare this point's location
     */
    equals(otherPoint) {
        return this.x === otherPoint.x && this.y === otherPoint.y
    }
}

/**
 * Represents the game board
 */
class Board {

    constructor() {
        this.el = document.getElementById('gameboard')  // The gameboard element
        this.clear()
        this.resize()

        // A collection of PlaceableObjects on the board. This will contain things like
        // Food and SnakeSegments, all of which are PlaceableObjects
        this.objects = []                               
    }

    /**
     * Sizes the gameboard so that it takes up the maximum amount of space within the browser viewport
     * but has width and height dimensions that are multiples of the block size
     */
    resize() {

        const w = window.innerWidth
        const h = window.innerHeight

        // Size the board so there is a left/right margin by subtracting 2 grid block sizes from the window width
        const wpx = w - px(2, false);  
        // Size the board so there is a bottom margin by subtracting 1 grid block size from the window height
        // Also make room for the header element by removing its height (this.el.offsetTop) from the window height
        const hpx = h - this.el.offsetTop - px(1, false);

        // Determine the size of the board in terms 'blocks' or 'grid squares' by dividing the pixel
        // dimensions with the number of pixels per block
        this.gridWidth = Math.floor(wpx / px(1, false))
        this.gridHeight = Math.floor(hpx / px(1, false))

        // Finally set the board element's CSS dimensions
        this.el.style.width = px(this.gridWidth)
        this.el.style.height = px(this.gridHeight)

        this.el.style.borderWidth = px(0.5);  // Give the gameboard a 1/2 block size border

    }

    /**
     * Returns a random position on the gameboard
     */
    randomGridPosition() {
        // TODO: Use the built-in Math object, the Point class, 
        //       and the properties of this Board class to return 
        //       a Point that is at a random location in the board
        return new Point(Math.floor(Math.random()*this.gridWidth), Math.floor(Math.random()*this.gridHeight))
    }

    /**
     * Returns a Point in the middle of the board (to the nearest Point)
     */
    midPoint() {
        // TODO: Use the built-in Math object, the Point class, 
        //       and the properties of this Board class to return 
        //       a Point that is in the middle of the board
        // NOTE: Be sure that the point is on INTEGER coordinates, 
        //       even if your board has odd-valued dimensions
        return new Point(Math.floor(this.gridWidth / 2), Math.floor(this.gridHeight / 2))
    }

    /**
     * Returns true if the given Point lies the board
     * @param point
     */
    isPointInside(point) {
        return point.x >= 0 && point.x < this.gridWidth && point.y >= 0 && point.y < this.gridHeight
    }

    /**
     * Remove all DOM elements from the gameboard DOM element
     */
    clear() {
        while ( this.el.lastChild ) {
            this.el.removeChild(this.el.lastChild)
        }
    }

    /**
     * This method achieves two things:
     *  1) Adds the given to this board's objects collection
     *  2) Adds a given object's DOM element to the gameboard DOM element
     * 
     * ASSUMPTIONS: 
     *  - obj has a method named 'addTo' that accepts a DOM element and
     *      adds to that element the 'el' property of some PlaceableObject
     *  - obj has a method named 'draw' that manipulates DOM properties
     *      such that it is drawn in its correct location on the board
     * 
     * @param obj The object to place on the gameboard
     */
    add(obj) {
        this.objects.push(obj)
        obj.addTo(this.el)
    }

    /**
     * Simply calls the draw() method of all PlaceableObjects on the board
     */
    draw() {
        for ( let o of this.objects ) {
            o.draw()
        }
    }
}

/**
 * Represents an object that may be placed on the game board.  Eg, Food, or SnakeSegment.
 * Each PlaceableObject has a gridPosition (an instance of Point) and an 'el' property
 * which is a reference to the DOM element represented by the PlaceableObject.
 * 
 * PlaceableObjects should only be 1x1 elements in the gameboard grid.  Thus, SnakeSegment
 * is a PlaceableObject, but Snake is NOT, even though Snake does share some methods with 
 * PlaceableObject.
 */
class PlaceableObject {
    /**
     * @param gridPosition A Point representing this object's position on the gameboard grid
     */
    constructor(gridPosition) {
        this.gridPosition = gridPosition
    }

    /**
     * Adds this object's DOM element (el) to the given container DOM element
     * @param container A DOM element to which this object's DOM element should be added
     */
    addTo(container) {
        container.appendChild(this.el)
    }

    /**
     * Removes this object's DOM element (el) from its parent
     */
    remove() {
        this.el.parentNode.removeChild(this.el)
    }

    /**
     * Returns true if the given Point p is at the same location as this object
     * @param p 
     */
    isAtPoint(p) {
        return this.gridPosition.equals(p)
    }

    /**
     * Returns true if the given PlaceableObject is at the same location as this object
     * @param otherPlaceableObject
     */
    isAtSamePositionAs(otherPlaceableObject) {
        return this.isAtPoint(otherPlaceableObject.gridPosition)
    }

    /**
     * Sets this object's DOM element to the pixel position corresponding to the object's grid position
     */
    draw() {
        this.el.style.top = px(this.gridPosition.y)
        this.el.style.left = px(this.gridPosition.x)
    }
}

class Food extends PlaceableObject {
    constructor(gridPosition) {    
        super(gridPosition)

        this.el = document.createElement('div')
        this.el.className = 'food'
        this.el.style.width = this.el.style.height = px(1)
        this.el.style.borderRadius = '50%'
        this.el.style.backgroundColor = 'green'
    }
}

/**
 * Represents an individual snake segment
 */
class SnakeSegment extends PlaceableObject {
    constructor(color, gridPosition, direction=null, isHead=false, isTail=false) {
        super(gridPosition)

        this.el = document.createElement('div')
        this.el.className = 'snake-segment'

        if ( isTail ) { this.el.classList.add('snake-tail') }
        if ( isHead ) { this.el.classList.add('snake-head') }

        this.el.style.backgroundColor = color
        this.el.style.width = this.el.style.height = px(1)

        this.direction = direction
    }

    get direction() { return this._direction }
    set direction(d) {
        // In addition to setting the _direction property, setting a segment's direction
        // must also manipulate the segment el's classlist accordingly to one of 
        // 'snake-dir-U', 'snake-dir-D', 'snake-dir-L', or 'snake-dir-R'
        // AND remove the previous dir-related class
        this.el.classList.remove('snake-dir-'+this._direction)
        this.el.classList.add('snake-dir-'+d)
        this._direction = d
    }

    untail() {
        this.el.classList.remove('snake-tail');
    }

    kill() {
        this.el.classList.add('snake-dead')
    }

    /**
     * Returns the next position for this snake segment, given its current direction
     */
    nextPosition() {
        switch( this.direction ) {
            case 'U':
                return new Point(this.gridPosition.x, this.gridPosition.y-1)
            case 'D':
                return new Point(this.gridPosition.x, this.gridPosition.y+1)
            case 'L':
                return new Point(this.gridPosition.x-1, this.gridPosition.y)
            case 'R':
                return new Point(this.gridPosition.x+1, this.gridPosition.y)
            default:
                return this.gridPosition
        }
    }

}

/**
 * Represents the main settings panel that the user interacts with
 */
class SettingsPanel {
    constructor(onSubmit) {

        // The method to call when the settings panel gets submitted
        this.submitCallback = onSubmit

        // NOTE the uses below of the bind() function to ensure that 'this' refers to the SettingsPanel
        // object and NOT the object that CALLED the handler function (which is the default in JavaScript)

        document.forms[0].addEventListener('submit', this.handleFormSubmit.bind(this));

    }

    get snakeCaste() {
        return document.getElementById('snake-caste').value
    }

    hide() {
        document.getElementById('settings-panel').classList.remove('open');
    }
    
    show() {
        document.getElementById('settings-panel').classList.add('open');
    }
    
    handleFormSubmit(event) {

        this.hide()

        // Call the callback that was given by the creator of the SettingsPanel object
        // (See the constructor above)
        this.submitCallback()

        // This prevents the form from actually submitting
        event.preventDefault()
    }

}

/**
 * Represents the snake game as a whole.  This is the main class of this app, which holds a
 * reference to the other main objects (board, snake, settings panel, etc) and coordinates their behaviour.
 */
class Game {

    constructor(manualTick) {

        // If manualTick is true, ticking only occurs per keypress rather than by timeout
        // (Useful for debugging)
        this.manualTick = manualTick

        // A reference to the settings panel.  We pass in a callback that SettingsPanel will
        // call when the Start button has been pressed.  Our callback will then get the game started.
        // This keeps code related to the settings panel GUI separate from code related to the game.
        this.settingsPanel = new SettingsPanel(this.settingsSubmitted.bind(this))

        // NOTE again the uses below of the bind() function to ensure that 'this' refers in this case to the Game
        // object and NOT the object that CALLED the handler function (which is the default in JavaScript)

        this.gameoverEl = document.getElementById('game-over');
        // Here, we bind the settingsPanel because the callback function show() belongs to settingsPanel
        this.gameoverEl.addEventListener('click', this.settingsPanel.show.bind(this.settingsPanel));

        // Here, we bind 'this' because the callback handleKeyPress belongs to this class (Game)
        window.addEventListener('keydown', this.handleKeyPress.bind(this))
    }

    hideGameover() {
        this.gameoverEl.classList.remove('show')
    }

    showGameover() {
        this.gameoverEl.classList.add('show')
    }

    updateGameInfo() {
        document.getElementById('score').innerText = this.snake.score;
        document.getElementById('speed').innerText = Math.round(this.snake.speed*100)/100
        document.getElementById('size').innerText = this.snake.segArraySize
        document.getElementById('caste').innerText = this.snake.caste
    }

    // This is the handler that we passed in to the SettingsPanel.  It gets called when the Start button
    // gets clicked.  Here we set the block size and start the game.  See also Game.constructor and 
    // SettingsPanel.handleFormSubmit above
    settingsSubmitted() {
        this.restart()
    }

    /**
     * Reset the game and start it over
     */
    restart() {
        // Make a new board
        this.board = new Board()

        // Pick a position in the middle of the game board
        const position = this.board.midPoint()

        // Pick a random initial direction
        const dirOptions = "UDLR"
        const dir = dirOptions[Math.floor(Math.random()*dirOptions.length)]

        const color = DEFAULT_SNAKE_COLOR
        

        // Make your own 'Snake' class that will allow the snake to grow
        if (this.settingsPanel.snakeCaste === 's') {
            this.snake = new Snake(color, position, dir, true, true)
        }
        else if (this.settingsPanel.snakeCaste === 'h') {
            this.snake = new HssishSnake(color, position, dir, true, true)
        }
        else if (this.settingsPanel.snakeCaste === 't') {
            this.snake = new TssishSnake(color, position, dir, true, true)
        }
        else if (this.settingsPanel.snakeCaste === 'k') {
            this.snake = new KssishSnake(color, position, dir, true, true)
        }

        this.board.add(this.snake)

        // Create a new food at a random location
        // place the food in random locations
        const foodPosition = this.board.randomGridPosition()
        this.food = new Food(foodPosition)
        this.board.add(this.food)

        this.board.draw()
        
        this.hideGameover()

        this.state = 'running'

        this.tick()
    }

    /**
     * This is the main driver of game progression.  This function should be called once per 'tick' of the game.
     * The number of ticks per second are determined by snakeSpeed, and this speed can be converted into a millisecond
     * value using the msPerTick function above.
     */
    tick() {
        // Since we could get here from a keypress (see Game.handleKeypress) we need to clear any existing 
        // timers before updating the game
        clearTimeout(this.timeoutId)
        this.update()

        // If manualTick is enabled, then there's nothing more to do.  User keypresses will be the only
        // thing that causes the game to 'tick' forward
        if ( ! this.manualTick ) { 
            // Otherwise, we set a timer so that the next tick will occur according to the snake's speed
            // whether or not the user presses a key
            this.timeoutId = setTimeout(() => { 
                // Only call a new tick if the game is not over
                if ( this.state === 'running' ) { 
                    this.tick()
                } 
            }, msPerTick(this.snake.speed))
        }
    }

    /**
     * Returns true if the game is over
     */
    isGameOver() {

        // Creates parameter for the next position of the snakes head
        const nextHeadPosition = this.snake.nextHeadPosition()
        // Game is over if either the next head position is outside the board...
        // Check whether the snake collides with itself
        return ! this.board.isPointInside(nextHeadPosition) || this.snake.laysOnPoint(nextHeadPosition)
        
     
    }

    /**
     * Updates the game state
     */
    update() {

        if ( this.isGameOver() ) { 
            this.showGameover()
            this.snake.kill()
            this.state = 'over'
        } else {

            // TODO: refactor this line to use the correct method on your new Snake class
            //this.snake.gridPosition = this.snake.nextHeadPosition()
            this.snake.slither()

            // TODO: refactor this line to use the correct method on your new Snake class
            if ( this.snake.isHeadOn(this.food) ) {

                
                this.snake.incrementScore()
               
                this.snake.speedUp()

                this.var = this.snake.grow()
                if (this.var != null) {
                    this.board.add(this.var)
                }

                // The current food has been eaten! Remove it and make a new one at a random location
                this.food.remove()
                const foodPosition = this.board.randomGridPosition()
                this.food = new Food(foodPosition)
                this.board.add(this.food)
            } 

            this.board.draw()

            this.updateGameInfo()
        }
    }

    handleKeyPress(event) {

        const key = event.key

        if ( this.state === 'running' ) {
            if ( key === 'ArrowDown' || key === 'ArrowUp' || key === 'ArrowLeft' || key === 'ArrowRight' ) {

                switch (key) {
                    case 'ArrowDown':
                        this.snake.direction = 'D'
                        break
                    case 'ArrowUp':
                        this.snake.direction = 'U'
                        break
                    case 'ArrowLeft':
                        this.snake.direction = 'L'
                        break
                    case 'ArrowRight':
                        this.snake.direction = 'R'
                        break
                }

                // We call tick directly here so that any time the user presses a key the snake moves immediately
                this.tick();
            }
        }
    }

}

class Snake {
    constructor(color, position, direction) {
        
        this.color = color

        this.score = 0

        this.speed = INITIAL_SNAKE_SPEED

        this.head = new SnakeSegment(color, position, direction, true, true)

        //let snakeArr = [this.head]
        //this.segments = snakeArr

        //this.segments = [this.head]

        //this.direction = Snake.direction

        this.segments = []
        this.segments.push(this.head)
    }

    addTo(el) {
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].addTo(el)
        }
    }

    draw(el) {
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].draw(el)
        }
    }


    // need PlaceableObject. here?
    kill() {
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].kill()
        }
    }

    /**
     * @param {string} dir
     */
    set direction(dir) {
        this.head.direction = dir
    }
    get segArraySize(){
        return this.segments.length
    }

    get caste() {
            return "Sss'ish"
    }

    nextHeadPosition() {
        return this.head.nextPosition()
    }

    isHeadOn(placeableObject) {
        return this.head.isAtSamePositionAs(placeableObject)
    }

    slither() {
        this.nextDir = this.head.direction
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].gridPosition = this.segments[i].nextPosition()
            this.dirForNextSegment = this.segments[i].direction // current segments direction 
            this.segments[i].direction = this.nextDir // segments direction is direction of segment infront of it
            this.nextDir = this.dirForNextSegment // equals current segments direction to be used by next one
        }
    }
    
    grow() {
        
        this.segments[this.segments.length - 1].untail()
        this.newSnakeSeg = new SnakeSegment(this.color, this.segments[this.segments.length - 1].gridPosition, null, false, true )
        this.segments.push(this.newSnakeSeg)
        return this.newSnakeSeg
    }

    laysOnPoint(p) {
        for (let i = 0; i < this.segments.length; i++) {
            if (this.segments[i].isAtPoint(p)) {
                return true
            } 
        }
        return false
    }

    speedUp() {
        this.speed *= 1.05
    }

    incrementScore() {
        this.score += 10
    }

}
   //color, position, direction                                              
class HssishSnake extends Snake {
        get caste() {
            //super.caste()
            return "Hss'ish"
        }

        incrementScore() {
            this.score += 12
        }
    
}
class TssishSnake extends Snake {
    
        get caste() {
            return "Tss'ish"
        }

        speedUp() {
            this.speed *= 1.01
        }

}

class KssishSnake extends Snake {
    
        get caste() {
            return "Kss'ish"
        }
    
        grow() {
            console.log(Math.floor(Math.random()*2))
            if (Math.floor(Math.random()*2) === 1) {
                //super.grow() // Doesn't work? Seems like it should... had to copy whole grow() into here.
                this.segments[this.segments.length - 1].untail()
                this.newSnakeSeg = new SnakeSegment(this.color, this.segments[this.segments.length - 1].gridPosition, null, false, true )
                this.segments.push(this.newSnakeSeg)
                return this.newSnakeSeg
            } else {
                return null
            }
        }

}






// This is where it all begins!
window.addEventListener('load', function() {

    // Make a new game, and set it to manual tick if the URL has the query string '?manual'
    new Game(location.search == "?manual")
});