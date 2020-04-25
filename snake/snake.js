"use strict"

const DEFAULT_BLOCK_SIZE = 50         // Number of pixels per gameboard grid square
const DEFAULT_SNAKE_COLOR = '#721745'
const INITIAL_SNAKE_SPEED = 5         // In grid blocks/sec

let blockSize

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

        const x = Math.floor(Math.random() * this.gridWidth)
        const y = Math.floor(Math.random() * this.gridHeight)

        return new Point(x, y)
    }

    /**
     * Returns a Point in the middle of the board (to the nearest Point)
     */
    midPoint() {
        const x = Math.floor(this.gridWidth/2)
        const y = Math.floor(this.gridHeight/2)
        return new Point(x, y)
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
     *  1) Adds the given PlaceableObject to this board's objects collection
     *  2) Adds a given PlaceableObject's DOM element to the gameboard DOM element
     *
     * ASSUMPTIONS:
     *  - obj has a method named 'addTo' that accepts a DOM element and
     *      adds to that element the 'el' property of some PlaceableObject
     *  - obj has a method named 'draw' that manipulates DOM properties
     *      such that it is drawn in its correct location on the board
     *
     * @param {PlaceableObject} obj The object to place on the gameboard
     */
    add(obj) {
        this.objects.push(obj)
        obj.addTo(this.el)
    }

    /**
     * Simply calls the draw() method of all PlaceableObjects on the board
     */
    draw() {
        this.objects.forEach( o => o.draw() )
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
 * Represents a snake, which consists of a number of SnakeSegments
 */
class Snake {
    constructor(color, position, dir) {
        this.color = color

        // Start a snake with just a single segment that will be the snake's head
        // and (for now) its tail
        const head = new SnakeSegment(color, position, dir, true, true)
        this.head = head

        // The snake's segments are stored in an array
        this.segments = []
        this.segments.push(head)

        this.speed = INITIAL_SNAKE_SPEED
        this.score = 0
    }

    // By default, a snake is "Sss'ish"
    get caste() {
        return "Sss'ish"
    }

    // The size of the snake is simply the number of segments it has
    get size() {
        return this.segments.length
    }

    // The head segment determines the snake's direction.
    // See the slither() method for how the remaining segments follow the head
    set direction(dir) {
        this.head.direction = dir;
    }

    /**
     * Adds the snake (ie, the DOM elements for each of its segments) to the given DOM element
     * @param el The DOM element to which the snake's segments should be added
     */
    addTo(el) {
        this.segments.forEach(s => s.addTo(el))
    }

    draw() {
        this.segments.forEach(s => s.draw())
    }

    kill() {
        this.segments.forEach( s => s.kill())
    }

    /**
     * Add a new segment to the snake
     */
    grow() {
        // First, get the old tail, and make sure it is no longer marked as the tail
        const tail = this.segments[this.segments.length-1]
        tail.untail()

        // Then make a new segment which will become the new tail
        const newTail = new SnakeSegment(this.color, tail.gridPosition, null, false, true);
        this.segments.push(newTail)

        return newTail
    }

    speedUp() {
        this.speed *= 1.05
    }

    incrementScore() {
        this.score += 10
    }

    /**
     * Returns true if any of the snake's segments are at the same location as the give Point p
     * @param p The Point to check
     */
    laysOnPoint(p) {
        for ( const s of this.segments ) {
            if ( s.isAtPoint(p) ) { return true; }
        }
        return false;
    }

    /**
     * Returns true if the snake's head segment is at the same location as the give PlaceableObject
     * @param placeableObject The PlaceableObject to check
     */
    isHeadOn(placeableObject) {
        return this.head.isAtSamePositionAs(placeableObject)
    }

    /**
     * Returns the next position of the snake's head based on its currect direction
     */
    nextHeadPosition() {
        return this.head.nextPosition()
    }

    /**
     * Moves all the snake's segments in their current direction, and updates their directions
     * such that the segments follow the head
     */
    slither() {
        // nextDir will be the NEW direction of the segment being processed in each iteration of the loop below
        let nextDir = this.head.direction
        for ( let s of this.segments ) {
            // Update the segment's position to its next position
            s.gridPosition = s.nextPosition()

            const oldDir = s.direction  // Remember its current direction so we can use it as the next nextDir
            s.direction = nextDir       // Update the segment's direction to the nextDir (which was the previous segments direction)
            nextDir = oldDir            // Finally, set up nextDir for the next iteration
        }
    }
}

// Since we extend the main Snake class, we ONLY need to specify the code
// that makes each snake subclass unique!
class HssishSnake extends Snake {
    get caste() { return "Hss'ish" }

    incrementScore() {
        this.score += 12
    }
}
class TssishSnake extends Snake {
    get caste() { return "Tss'ish" }
    speedUp() {
        this.speed *= 1.01
    }
}
class KssishSnake extends Snake {
    get caste() { return "Kss'ish" }
    grow() {
        if ( Math.random() > 0.5 ) {
            return super.grow()
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

        // TODO: give the snake-color input a default value
        document.getElementById('snake-color').value = DEFAULT_SNAKE_COLOR
        // TODO: give the block-size input a default value
        document.getElementById('block-size').value = DEFAULT_BLOCK_SIZE
        // NOTE the uses below of the bind() function to ensure that 'this' refers to the SettingsPanel
        // object and NOT the object that CALLED the handler function (which is the default in JavaScript)

        document.forms[0].addEventListener('submit', this.handleFormSubmit.bind(this));

        document.getElementById('snake-caste').addEventListener('input', this.updateSnakeNamePlaceholder.bind(this))
        // Call it once immediately to initialize the placeholder as soon as the panel loads
        this.updateSnakeNamePlaceholder()

        document.getElementById('block-size').addEventListener('input', this.updateBlockSizePreview.bind(this))
        // Call it once immediately to initialize the preview as soon as the panel loads
        this.updateBlockSizePreview()

        // Form validation & assistive functions
        document.getElementById('snake-name').addEventListener('input', this.stripInvalidChars.bind(this) )
        document.getElementById('snake-name').addEventListener('input', this.formatName.bind(this))
        document.getElementById('snake-name').addEventListener('input', this.detectCaste.bind(this))

        document.getElementById('snake-name').addEventListener('input', this.validateName.bind(this))
        document.getElementById('snake-caste').addEventListener('change', this.validateName.bind(this))
        // Call it once immediately to initialize validation as soon as the panel loads
        this.validateName()
    }

    get snakeCaste() {
        return document.getElementById('snake-caste').value
    }

    // A getter for snakeColor
    get snakeColor() {
        return document.getElementById('snake-color').value
    }

    //  A getter for blockSize
    get blockSize() {
        return document.getElementById('block-size').value
    }

    // A getter for snakeName
    get snakeName() {
        return document.getElementById('snake-name').value
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

    updateSnakeNamePlaceholder() {
        // Updates #snake-name placeholder to give a valid example of a name for the chosen caste
        var caste = document.getElementById('snake-caste').value

        if (caste === "s") {
            document.getElementById('snake-name').placeholder = "SsSss -< --< SssS"
        }
        if (caste === "h") {
            document.getElementById('snake-name').placeholder = "Hssss ---< HsSsS"
        }
        if (caste === "t") {
            document.getElementById('snake-name').placeholder = "TsSs -< --<"
        }
        if (caste === "k") {
            document.getElementById('snake-name').placeholder = "KsSss ---< -< KssS"
        }

    }

    updateBlockSizePreview() {
        //Update the #block-size-preview element to be the block size picked by the user
        document.getElementById('block-size-preview').style.width = this.blockSize + "px"
        document.getElementById('block-size-preview').style.height = this.blockSize + "px"
    }

    stripInvalidChars() {
        // Strips invalid characters from the snake name string
        //var name = document.getElementById('snake-name').value.split();
        var name = document.getElementById('snake-name').value
        var caste = document.getElementById('snake-caste').value


        //Prevents characters than the ones below from being input after the first character.
        for (var i = 0; i < name.length -1; i++ ){
            // checks if string ends with allowed character
            // What's the point of looping through each character if you're just checking the last character every time?
            // What you have here doesn't prevent someone form insert invalid characters by placing the cursor in the middle of the name
            if (!name.endsWith('S') && !name.endsWith('s') && !name.endsWith('H') && !name.endsWith('h')
            && !name.endsWith('K') && !name.endsWith('k') && !name.endsWith('T') && !name.endsWith('t')
            && !name.endsWith(' ') && !name.endsWith('-') && !name.endsWith('<')) { 
                // removes last character of string if it's not equal to an allowed character
                document.getElementById('snake-name').value = name.substring(0,name.length-1)
            }
        }


    }



    formatName() {
        // Automatically uppercase any letter that comes after a space or apostrophe
        var name = document.getElementById('snake-name').value;

        // Group together anyword, then replace it's first character with an uppercase
        document.getElementById('snake-name').value = name.replace(/\b\w/g, name.charAt(0).toUpperCase())
        
        
    }

    detectCaste() {
        // Automatically select the snake caste based on the name entered by the user
        var firstChar = document.getElementById('snake-name').value.charAt(0)

        if (firstChar === 'S') {
            document.getElementById('snake-caste').value = 's'
        }
        if (firstChar === 'H') {
            document.getElementById('snake-caste').value = 'h'
        }
        if (firstChar === 'T') {
            document.getElementById('snake-caste').value = 't'
        }
        if (firstChar === 'K') {
            document.getElementById('snake-caste').value = 'k'
        }
    
    }

    validateName() {
        // Set custom validity messages for invalid snake names
        var name = document.getElementById('snake-name').value
        var caste = document.getElementById('snake-caste').value
        var input = document.querySelector('input')
        
        // resets custom validity when input changes
        input.setCustomValidity("")

    

        if (caste === "s") {
            if (/^Ss+s( (ss+s|-+<))*$/gi.test(name) == false) {
                input.setCustomValidity("Must begin with 'S' followed by 2 or more s's, seperated by a single space. Tounge flicks must contain one or more -'s with a < at the end.")
            } 
        }
        if (caste === "h") {
            if (/^Hs+s( (Hs+s|-+<))*$/gi.test(name) == false) {
                input.setCustomValidity("Must begin with 'H' followed by 2 or more s's, seperated by a single space. Tounge flicks must contain one or more -'s with a < at the end.")
            } 
        }
        if (caste === "t") {
            if (/^Ts+s( (Ts+s|-+<))*$/gi.test(name) == false) {
                input.setCustomValidity("Must begin with 'T' followed by 2 or more s's, seperated by a single space. Tounge flicks must contain one or more -'s with a < at the end.")
            } 
        }
        if (caste === "k") {
            if (/^Ks+s( (Ks+s|-+<))*$/gi.test(name) == false) {
                input.setCustomValidity("Must begin with 'K' followed by 2 or more s's, seperated by a single space. Tounge flicks must contain one or more -'s with a < at the end.")
            } 
        }
            

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
        document.getElementById('caste').innerText = this.snake.caste
        document.getElementById('size').innerText = this.snake.size
        document.getElementById('score').innerText = this.snake.score;
        document.getElementById('speed').innerText = Math.round(this.snake.speed*100)/100
        // TODO: set the name to be the name picked by the user in the Settings Panel
        document.getElementById('name').innerText = this.settingsPanel.snakeName
    }

    // This is the handler that we passed in to the SettingsPanel.  It gets called when the Start button
    // gets clicked.  Here we set the block size and start the game.  See also Game.constructor and
    // SettingsPanel.handleFormSubmit above
    settingsSubmitted() {

        // blockSize is our one global variable now
        // TODO: use the block size picked by the user in the Settings Panel
       // blockSize = DEFAULT_BLOCK_SIZE
        blockSize = this.settingsPanel.blockSize;

        this.restart()
    }

    /**
     * Reset the game and start it over
     */
    restart() {
        // Make a new board
        this.board = new Board()

        // Get a random initial direction
        const dir = "UDLR"[Math.floor(Math.random()*4)]

        // Use the color picked by the user in the Settings Panel
        const color = this.settingsPanel.snakeColor;

        const position = this.board.midPoint()

        // Create the appropriate snake object based on the caste chosen by the user
        switch ( this.settingsPanel.snakeCaste ) {
            case "h":
                this.snake = new HssishSnake(color, position, dir)
                break
            case "k":
                this.snake = new KssishSnake(color, position, dir)
                break
            case "s":
                this.snake = new Snake(color, position, dir)
                break
            case "t":
                this.snake = new TssishSnake(color, position, dir)
                break
        }

        this.board.add(this.snake)

        // Create a new food at a random location
        this.food = new Food(this.board.randomGridPosition())
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

        const nextHeadPosition = this.snake.nextHeadPosition()

        // Game is over if either the next head position is outside the board...
        return ! this.board.isPointInside(nextHeadPosition)
            || // ... or ...
            // The next position is the same as another segment's
            this.snake.laysOnPoint(nextHeadPosition)
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

            this.snake.slither()

            if ( this.snake.isHeadOn(this.food) ) {

                // We use function calls here instead of setting the properties directly
                // so that we can make use of polymorphism in the Snake classes.
                // We can call the functions and each caste of snake will automatically make
                // the appropriate adjustments according to its caste
                this.snake.incrementScore()
                this.snake.speedUp()

                const newSegment = this.snake.grow()
                // Because some snake types may or may not grow, we need to check to make sure
                // we actually did get a new segment from the grow function before attempting to add id
                // (otherwise a run-time error would occur because newSegment would be null)
                if ( newSegment ) {
                    this.board.add(newSegment)
                }

                // The current food has been eaten! Remove it and make a new one at a random location
                this.food.remove()
                this.food = new Food(this.board.randomGridPosition())
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

// This is where it all begins!
window.addEventListener('load', function() {

    // Make a new game, and set it to manual tick if the URL has the query string '?manual'
    new Game(location.search == "?manual")
});