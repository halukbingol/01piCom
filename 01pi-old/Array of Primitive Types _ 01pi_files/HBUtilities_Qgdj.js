// =====================
// HBUtilities.js
//

// when       who what
// 2018-05-02 HB init

class HBUtilities {


    static makeAGrid20(s) {
        let gridArrCol = new Array();
        let gridArrRow = new Array();
        for (let i = 0; i < 300; i += 20) {
            gridArrCol.push(i);
            gridArrRow.push(i);
        }
        HBUtilities.makeAGrid(s, gridArrCol, gridArrRow);
    } // makeAGrid20

    /* 
     *  makeAGrid(arrX, arrY, w, h)
     *  draws a grid
     *  arrX: array of x values
     *  arrY: array of y 
     *  Convention: Point (arrX[0], arrY[0]) is the upper left corner
     */
    static makeAGrid(s, arrX, arrY) {
        // let line=s.line
        // grid horizontal
        let xLeft = arrX[0];
        let xRight = arrX[arrX.length - 1];
        let gridH = new Array();
        for (let i = 0; i < arrY.length; i++) {
            gridH[i] = s.line(xLeft, arrY[i], xRight, arrY[i]).attr({ opacity: ".2", fill: "none", strokeWidth: "2", stroke: "red" });
        };
        // grid vertical
        let yTop = arrY[0];
        let yBottom = arrY[arrY.length - 1];
        let gridV = new Array();
        for (let i = 0; i < arrX.length; i++) {
            gridV[i] = s.line(arrX[i], yTop, arrX[i], yBottom).attr({ opacity: ".2", fill: "none", strokeWidth: "2", stroke: "red" });
        };
    } // makeAGrid

    static pmButtonClicked(delta) {
        let elementStepNo = document.getElementById("HBUtilities_idPMStepNo");
        let step = Number(elementStepNo.innerHTML) + delta;
        elementStepNo.innerHTML = step;
        //
        hbPlusMinus.stepByStep(step);
    } // pmButtonClicked


    /*
     *  example
     */
    // <p>
    //     <button id="HBUtilities_idM" name="2" value="-1" onclick="HBUtilities.pmButtonClicked(-1)">Minus
    //     </button>
    //     <span id="HBUtilities_idPMStepNo">
    //         0
    //     </span>
    //     <button id="HBUtilities_idP" name="1" value="+1" onclick="HBUtilities.pmButtonClicked(+1)">Plus
    //     </button>
    // </p>


} // class HBUtilities


class HBStack {
    
    constructor() {
        this.stack = new Array();
    }

    push(value) {
        this.stack.push(value);
    }

    pop() {
        return this.stack.pop();
    }

    peek() {
        if (this.stack.length == 0) {
            return HBStack.STACK_UNDERFLOW;
        } else {
            return this.stack[this.stack.length - 1];
        }
    }

    static get STACK_UNDERFLOW() { return "stack underflow"; }

}