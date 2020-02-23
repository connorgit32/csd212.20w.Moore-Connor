(function() {

    var testResultsContainer;
    var testNumber = 0;
    
    function init() {
    
        const css = `
            #test-container { 
                counter-reset: testnumber;
                border: 1px solid rgba(0,0,0,0.1); 
                font-family: monospace;
            } 
            #test-container .test {
                padding: 0.5em;
            }
    
            #test-container .description {
                display: inline;
            }
            #test-container .test.passed { background-color: rgba(0,255,0,0.1); } 
            #test-container .test.passed::before {
                counter-increment: testnumber;
                content: "#" counter(testnumber) " PASSED:";
                margin-right: 1em;
                display: inline-block;
                color: green;
                font-weight: bold;
            }
            #test-container .failed { background-color: rgba(255,0,0,0.1); }
            #test-container .failed::before {
                counter-increment: testnumber;
                content: "#" counter(testnumber) " FAILED:";
                margin-right: 1em;
                display: inline-block;
                color: red;
                font-weight: bold;
            }
            #test-container .fail-message {
                margin-left: 2em;
                color: rgba(255,0,0,0.5);
            }
            #test-container .fail-message::before {
                content: "REASON:";
                margin-right: 1em;
            }
        `;
        const styleEl = document.createElement('style');
        styleEl.appendChild(document.createTextNode(css));
        document.head.appendChild(styleEl);
    
        const testButton = document.createElement('button');
        testButton.innerHTML = "Run Tests";
        document.body.appendChild(testButton);
    
        testButton.addEventListener('click', runTests);
    }
    
    class Test {
        constructor(containerEl) {
            this.containerEl = containerEl;
        }
    
        pass() {
            this.containerEl.classList.add('passed');
        }
    
        fail(message) {
            this.containerEl.classList.add('failed');
    
            const failMessage = document.createElement('div');
            failMessage.className = "fail-message";
            failMessage.appendChild(document.createTextNode(message));
            this.containerEl.appendChild(failMessage);
        }
    }
    
    function test(description, testFunc) {
        const testContainer = document.createElement('div');
        testContainer.className = "test"
        
        const desc = document.createElement('div');
        desc.className = "description"
        desc.appendChild(document.createTextNode(description));
    
        testContainer.appendChild(desc);
        testResultsContainer.appendChild(testContainer);
    
        const t = new Test(testContainer);
    
        testFunc(t);
    }
    
    function initTests() {
        const existingTestContainer = document.getElementById('test-container');
    
        if ( existingTestContainer ) {
            existingTestContainer.parentElement.removeChild(existingTestContainer);
        }
    
        const newTestContainer = document.createElement('div');
        newTestContainer.id = "test-container";
    
        document.body.appendChild(newTestContainer);
    
        testResultsContainer = newTestContainer;
    }
    
    function checkForElement(selector) {
        checkForElements(selector, 1);
    }
    function checkForElements(selector, expectedNumberOfElements=-1) {
        const isOrAre = expectedNumberOfElements == 1 ? "is" : "are";
    
        let message = "";
        if ( expectedNumberOfElements === -1 ) {
            message = "the selector '" + selector + "' finds at least 1 element";
        } else {
            message = "the selector '" + selector + "' finds exactly " + expectedNumberOfElements + " element(s)";
        }
    
        test(message, function(t) {
            const els = document.querySelectorAll(selector);
    
            if ( expectedNumberOfElements === -1 ) {
                if ( els.length > 0 ) {
                    t.pass();
                } else {
                    t.fail();
                }
            } else {
                if ( els.length === expectedNumberOfElements ) {
                    t.pass();
                } else {
                    t.fail();
                }
            }
        });
    }
    
    function getDisplayText() {
        return document.querySelectorAll('.display')[0].innerHTML.trim();
    }
    
    function pressClear() {
        document.querySelectorAll('.clear')[0].click();
    }
    function pressNumber(n) {
        const numberButtons = document.querySelectorAll('.num');
    
        // We assume the number buttons are in the order specified by the lab:
        //  7 8 9
        //  4 5 6
        //  1 2 3
        //  0 
        switch ( n ) {
            case "7":
                numberButtons[0].click();
                break;
            case "8":
                numberButtons[1].click();
                break;
            case "9":   
                numberButtons[2].click();
                break;
            case "4":   
                numberButtons[3].click();
                break;
            case "5":   
                numberButtons[4].click();
                break;
            case "6":   
                numberButtons[5].click();
                break;
            case "1":   
                numberButtons[6].click();
                break;
            case "2":   
                numberButtons[7].click();
                break;
            case "3":   
                numberButtons[8].click();
                break;
            case "0":   
                numberButtons[9].click();
                break;
        }
    }
    
    function pressOp(op) {
        switch (op) {
            case "/":
                document.querySelectorAll('.div')[0].click();
                break;
            case "x":
                document.querySelectorAll('.mul')[0].click();
                break;
            case "+":
                document.querySelectorAll('.add')[0].click();
                break;
            case "-":
                document.querySelectorAll('.sub')[0].click();
                break;
            case "=":
                document.querySelectorAll('.eq')[0].click();
                break;
            case ".":
                document.querySelectorAll('.point')[0].click();
                break;
        }
    }
    
    function testButtonSequence(sequence, expectedDisplayText) {
    
        pressClear();
    
        var expandedSequence = [];
        for ( c of sequence ) {
            if ( "0" <= c && c <= "9" ) {
                pressNumber(c);
                expandedSequence.push(c);
            } else if ( c === "c" ) {
                pressClear();
                expandedSequence.push("Clear");
            } else if ( c === "/" ) {
                pressOp(c);
                expandedSequence.push('Ã·');
            } else if ( "x+-.=".includes(c) ) {
                pressOp(c)
                expandedSequence.push(c);
            } else {
                throw new Error("Unknown sequence character '" + c + "'");
            }
        }
    
        test("display shows '" + expectedDisplayText + "' after pressing " + expandedSequence.join(', '), function(t) {
            const text = getDisplayText();
            if ( text == expectedDisplayText ) { t.pass(); }
            else { t.fail("the display shows '" + text + "'"); }
        });
    }
    
    function runTests() {
    
        initTests();
    
        checkForElement('div.display');
        checkForElement('.clear');
        checkForElement('.eq');
        checkForElement('.mul');
        checkForElement('.div');
        checkForElement('.add');
        checkForElement('.sub');
        checkForElement('.point');
        checkForElements('.num', 10);
    
        test("display starts with text content '0'", function(t) {
            const text = getDisplayText();
            if ( text == '0' ) { t.pass(); }
            else { t.fail("the display contains the content '" + text + "'"); }
        });
    
        testButtonSequence("c", "0");
        testButtonSequence("1c", "0");
        testButtonSequence("1c2", "2");
        testButtonSequence("1c2c", "0");
        testButtonSequence("1", "1");
        testButtonSequence("12", "12");
        testButtonSequence("12.", "12.");
        testButtonSequence("12.01", "12.01");
        testButtonSequence(".", "0.");
        testButtonSequence("..", "0.");
        testButtonSequence("0.", "0.");
        testButtonSequence("01.", "1.");
        testButtonSequence("01..", "1.");
        testButtonSequence("0.1.", "0.1");
        testButtonSequence("0", "0");
        testButtonSequence("01", "1");
        testButtonSequence("00", "0");
        testButtonSequence("0.0", "0.0");
        testButtonSequence("0.01", "0.01");
        testButtonSequence(".01", "0.01");
        testButtonSequence("00.01", "0.01");
        testButtonSequence("00.010", "0.010");
        testButtonSequence("1=", "1");
        testButtonSequence("1+", "1");
        testButtonSequence("1+=", "1");
        testButtonSequence("1+-=", "1");
        testButtonSequence("1+2", "2");
        testButtonSequence("1+2=", "3");
        testButtonSequence("1+2=+", "3");
        testButtonSequence("1+2=+5=", "8");
        testButtonSequence("1+2=4", "4");
        testButtonSequence("1+2=4+5=", "9");
        testButtonSequence("2x30", "30");
        testButtonSequence("2x30=", "60");
        testButtonSequence("30/2", "2");
        testButtonSequence("30/2=", "15");
        testButtonSequence("3.2+2=", "5.2");
        testButtonSequence("3.2+2.4=", "5.6");
        testButtonSequence("3-2", "2");
        testButtonSequence("3-2=", "1");
        testButtonSequence("-2=", "-2");
        testButtonSequence("+-x2=", "0");
        testButtonSequence("2+-x3=", "6");
        testButtonSequence("2+-x3+=", "6");
        testButtonSequence("2+-x3+-4=", "2");
        testButtonSequence("5/4x3-2+1=", "2.75");
    
        // Use these if you did NOT implement order of operations
        testButtonSequence("1+2-3x4/5=", "0");
        testButtonSequence("1+2x3/4-5=", "-2.75");
        testButtonSequence("1+2x3-4/5=", "1");
    
        // Use these if you DID implement order of operations
        // testButtonSequence("1+2-3x4/5=", "0.6");
        // testButtonSequence("1+2x3/4-5=", "-2.5");
        // testButtonSequence("1+2x3-4/5=", "6.2");
    }
    
    window.addEventListener('load', init);
    
    })();