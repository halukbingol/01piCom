// =====================
// HBPlusMinus.js
//

// when       who what
// 2018-05-02 HB init

'use strict';
class HBPlusMinus {

    // =============================================================== V
    constructor(
        arrDrawable,
        arrSteps,
        isDescrBlock,
        isDescrStep,
        isCode,
        isTrace,
        isEclipse,
        isBoard,
        traceHeaderLinesNO
    ) {
        'use strict';

        //
        this._arrDrawable = arrDrawable;
        this.arrSteps = arrSteps;
        //
        this.isDescrBlock = isDescrBlock;
        this.isDescrStep = isDescrStep;
        this.isCode = isCode;
        this.isTrace = isTrace;
        this.isEclipse = isEclipse;
        this.isBoard = isBoard;
        // 
        this.stateCurr = HBPlusMinus.STATE_INIT;
        this.stateNext;
        this.arrSteps = new Array();
        this._arrDrawable;
        this._arrHighlight;
        this._arrDescription;
        this._arrTrace;
        this.traceSkipNO = 0;
        this.traceHeaderLinesNO = traceHeaderLinesNO;
        // this._numberOfSteps;
        // visibility
        this.transVisibilityOn;
        this.transVisibilityOff;
        this.arrVisibilityOff; // list of to be invisible
        // highlight
        this.transHighlightOn;
        this.transHighlightOff;
        this.strokeOn;
        this.strokeOff;
        this.strokeWidthOn;
        this.strokeWidthOff;
        this.arrVisibilityOn; // list of to be visible
        // 
        this.readIn(); // @HB is this necessary?
        // 
        this.stackHighlight = new HBStack();
        this.stackHighlight.push([]); // start with empth array in stack
        // 
        this.stackVisible = new HBStack();
        this.stackVisible.push([]); // start with empth array for On in stack
        this.stackVisible.push([]); // start with empth array for Off in stack
        // 
        this.stackVariable = new HBStack();
        this.stackVariable.push(0); // start with value 0 in stack
    } // constructor

    // =============================================================== V
    setState(state, isForward) {
        /*
         * Sets state and visibility forward and backward
         * transVisibilityOn: visible when forward
         * transVisibilityOff: non-visible when forward
         */
        'use strict';

        this.stateCurr = state;
        if (isForward) {
            this.transVisibilityOn = true;
            this.transVisibilityOff = !this.transVisibilityOn;
            this.transHighlightOn = true;
            this.transHighlightOff = !this.transHighlightOn;
            this.strokeOn = HBObjectDrawable.COLOR_HIGHLIGHT;
            this.strokeOff = HBObjectDrawable.COLOR_ORIGINAL;
            this.strokeWidthOn = HBObjectDrawable.STROKE_WIDTH_HIGHLIGHTED;
            this.strokeWidthOff = HBObjectDrawable.STROKE_WIDTH_NORMAL;
        } else {
            this.stateCurr--;
            this.transVisibilityOn = false;
            this.transVisibilityOff = !this.transVisibilityOn;
            this.transHighlightOn = false;
            this.transHighlightOff = !this.transHighlightOn;
            this.strokeOn = HBObjectDrawable.COLOR_ORIGINAL;
            this.strokeOff = HBObjectDrawable.COLOR_HIGHLIGHT;
            this.strokeWidthOn = HBObjectDrawable.STROKE_WIDTH_NORMAL;
            this.strokeWidthOff = HBObjectDrawable.STROKE_WIDTH_HIGHLIGHTED;
        }
    } // setState

    // =============================================================== V
    setVisibility(isForward, arrCurrOn, arrCurrOff) {
        this._setVisibilityArray(arrCurrOn, this.transVisibilityOn);
        this._setVisibilityArray(arrCurrOff, this.transVisibilityOff);
    } // setVisibility

    _setVisibilityArray(arr, trueFalse) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].setVisible(trueFalse);
        }
    } // _setVisibilityArray

    // =============================================================== V
    setHighlight(isForward, arrCurr) {
        let arrPrev;
        if (isForward) {
            arrPrev = this.stackHighlight.peek();
            this.stackHighlight.push(arrCurr);
            // first: previous 
            for (let i = 0; i < arrPrev.length; i++) {
                arrPrev[i].setHighlight(this.transHighlightOff);
            }
            // second: current 
            for (let i = 0; i < arrCurr.length; i++) {
                arrCurr[i].setHighlight(this.transHighlightOn);
            }
        } else {
            arrCurr = this.stackHighlight.pop();
            arrPrev = this.stackHighlight.peek();
            // first: current 
            for (let i = 0; i < arrCurr.length; i++) {
                arrCurr[i].setHighlight(this.transHighlightOn);
            }
            // second: previous
            for (let i = 0; i < arrPrev.length; i++) {
                arrPrev[i].setHighlight(this.transHighlightOff);
            }
        }
    } // setHighlight

    // =============================================================== V
    static get STATE_INIT() { return -1 }


    // =============================================================== V
    getNumberOfSteps() {
        // return this._numberOfSteps;
        return this._arrDescription.length;
    }

    // =============================================================== V
    stepByStep(stateNext) {
        'use strict';

        if (stateNext == HBPlusMinus.STATE_INIT) {
            // nop
        } else if (stateNext < 0) {
            return; // too little
        } else if (this._arrDescription.length <= stateNext) {
            return; // too big
        } else if (stateNext == this.stateCurr) {
            return;
        }

        //  description
        if (this.isDescrBlock) {
            this.repaintDescriptionBlock(stateNext);
        } else if (this.isDescrStep) {
            this.repaintDescriptionStep(stateNext);
        } else {
            onsole.log("**ERROR**", ' HBPlusMinus.stepByStep');
        }
        //  code
        if (this.isCode) {
            this.repaintCode(stateNext);
        }
        // board
        if (this.isBoard) {
            let isForward;
            if (this.stateCurr < stateNext) {
                isForward = true;
                for (let i = this.stateCurr + 1; i <= stateNext; i++) {
                    arrSteps[i](this, isForward);
                }
            } else {
                isForward = false;
                for (let i = this.stateCurr; i > stateNext; i--) {
                    arrSteps[i](this, isForward);
                }
            }
            this.repaintBoard(stateNext);
        }
        // trace 
        // Note: should be after board since board may skip advencement
        if (this.isTrace) {
            this.repaintTrace(stateNext);
        }
    } // stepByStep

    // =============================================================== V
    repaintDescriptionBlock(stateNext) {
        'use strict';

        document
            .getElementById("idViewDescr")
            .innerHTML = this._arrDescription[stateNext];
    } // repaintDescriptionBlock

    // =============================================================== V
    repaintDescriptionStep(stateNext) {
        'use strict';

        let str = "";
        for (let i = 0; i <= stateNext; i++) {
            str += this._arrDescription[i];
        }
        document
            .getElementById("idViewDescr")
            .innerHTML = str;
    } // repaintDescriptionStep

    // =============================================================== V
    repaintCode(stateNext) {
        'use strict';

        document
            .getElementById("idViewCodePre")
            .setAttribute("data-line", this._arrHighlight[stateNext]);
        Prism.highlightAll();
    } // repaintCode

    // =============================================================== V
    traceSkip(isForward) {
        'use strict';

        if (isForward) {
            this.traceSkipNO++;
        } else {
            this.traceSkipNO--;
        }
    } // traceSkip

    // =============================================================== V
    repaintTrace(stateNext) {
        'use strict';

        let str = "\n"; // prism puts some space in the first line. So make the first line empty.
        for (let i = 0; i <= stateNext + this.traceHeaderLinesNO - this.traceSkipNO; i++) {
            if (undefined != this._arrTrace[i]){
                str += this._arrTrace[i] + '\n';                
            }
        }
        document
            .getElementById("idViewTrace")
            .innerHTML = str;
        Prism.highlightAll();
    } // repaintTrace

    // =============================================================== V
    repaintBoard(stateNext) {
        'use strict';

        HBObjectDrawable.drawArrDrawable(s, this._arrDrawable);
    } // repaintBoard

    // =============================================================== V
    readIn() {
        'use strict';

        // get arrays
        // decription
        if (this.isDescrBlock || this.isDescrStep) {
            this.readInDescription();
        }
        if (this.isCode) {
            this.readInCode();
            this.readInHighlight();
        }
        if (this.isTrace) {
            this.readInTrace();
        }
    } // readIn

    // =============================================================== V
    readInDescription() {
        'use strict';

        let arr = [];
        let arrElement = document
            .getElementById("idInDescr")
            .querySelectorAll("div.hbDescriptionStep");
        for (let i = 0; i < arrElement.length; i++) {
            arr[i] = arrElement[i].innerHTML;
        }
        // return arr;
        this._arrDescription = arr;
    } // readInDescription

    // =============================================================== V
    readInCode() {
        'use strict';

        // remove the first empty line
        let str = document
            .getElementById("idInCode")
            .innerHTML;
        let arrStr = str.split("\n");
        // remove first empty lines
        for (let i = 0; i < arrStr.length; i++) {
            if (arrStr[i] == "") {
                arrStr.splice(i, 1);
                i--;
            } else {
                break;
            }
        }
        document
            .getElementById("idViewCode")
            .innerHTML = arrStr.join("\n");

    } // readInCode

    // =============================================================== V
    readInHighlight() {
        'use strict';

        let str = document
            .getElementById('idInHighlight')
            .innerHTML;
        str += "\n\n"; // in case last line has no endOfLine
        let arr = str.split("\n");
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].trim();
            if (arr[i] == ".") {
                arr[i] = "";
            }
        }
        // remove last if it is empty
        if (arr[arr.length - 1] == '') {
            arr.pop();
        }
        // return arr;
        this._arrHighlight = arr;
    } // readInHighlight

    // =============================================================== V
    readInTrace() {
        'use strict';

        let str = document
            .getElementById('idInTrace')
            .innerHTML;
        let arr = str.split("\n");
        // remove the first and the last empty lines
        let arr2 = new Array();
        for (let i = 0; i < arr.length - 1; i++) {
            arr2.push(arr[i]);
        }
        this._arrTrace = arr2;
    } // readInTrace

} // HBPlusMinus