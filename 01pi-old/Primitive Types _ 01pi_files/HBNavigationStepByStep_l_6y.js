// =====================
// HBNavigationStepByStep.js
//

// when       who what
// 2018-05-02 HB init

'use strict';
class HBNavigationStepByStep {

    constructor(s, numberOfStates, callbackNextState, that, hbPlusMinus) {
        'use strict';
        this._s = s;
        this._count = numberOfStates;
        this._state = HBNavigationStepByStep.STATE_0;
        this._callbackNextState = callbackNextState; // next step function
        this._that = that;
        this._hbPlusMinus = hbPlusMinus;
        // 
        this.setupGUIButtons(s);

        // 
        HBNavigationStepByStep.updateGUIButtons(HBNavigationStepByStep.STATE_0);
    } // constructor


    clickCallback(event) {
        'use strict';

        let hbNavigationStepByStep = this.that;

        // decide on next state
        let stateID = this.attr('id');
        let statePresent = hbNavigationStepByStep._state;
        let stateNext = statePresent;
        if (HBNavigationStepByStep.BUTTON_PREV == stateID) {
            stateNext--;
            if (stateNext < HBNavigationStepByStep.STATE_0) {
                stateNext = HBNavigationStepByStep.STATE_0;
            }
        } else if (HBNavigationStepByStep.BUTTON_NEXT == stateID) {
            stateNext++;
            if (stateNext >= hbNavigationStepByStep._count) {
                stateNext = hbNavigationStepByStep._count - 1;
            }
        } else {
            stateNext = stateID;
        }
        // update for next state
        hbNavigationStepByStep._state = stateNext;
        hbNavigationStepByStep._hbPlusMinus.stepByStep(stateNext);
        // update GUI
        HBNavigationStepByStep.updateGUIButtons(stateNext);
    } // clickCallback

    // update visual of the new state
    static updateGUIButtons(state) {
        'use strict';
        // make all "unselected"
        let htmlCollection = document.getElementsByClassName("state");
        let arrStateAll = Array.from(htmlCollection);
        for (let i = 0; i < arrStateAll.length; i++) {
            arrStateAll[i].setAttribute("fill", HBNavigationStepByStep.FILL_UNSELECTED);
        }
        // make the current state as "selected"
        arrStateAll[state].setAttribute("fill", HBNavigationStepByStep.FILL_SELECTED);
    } // updateGUIButtons

    // 
    static get CLASS_STATE() { return "state" }
    static get BUTTON_PREV() { return "prev" }
    static get BUTTON_NEXT() { return "next" }
    static get STATE_0() { return 0 }
    static get FILL_UNSELECTED() { return "blue" }
    static get FILL_SELECTED() { return "pink" }

    setupGUIButtons(s) {
        'use strict';
        let scale = 40;
        let space = 5;
        let scale1o4 = scale / 4;
        let scale1o2 = scale / 2;
        let scale3o4 = scale * 3 / 4;
        // 
        let centerY = scale1o2 + space;
        let centerY1o4 = scale1o4;
        // 
        let centerXNow = 0;
        // 
        let X = 0; //40;
        let Y = 0; //40;
        //  Triangle for prev
        let D = 25;
        let F = .866; // Math.sqrt(3)/2;
        let triangle =
            "M" + X + "," + Y +
            "L" + (X + F * D) + "," + (Y + D / 2) +
            "L" + (X + F * D) + "," + (Y - D / 2) +
            "z";
        let triangleX = 10;
        // 
        let buttonCircle;
        centerXNow += scale;

        // button Prev
        s.path(triangle)
            .transform("t" + (centerXNow - scale1o2 + space) + "," + (centerY)).attr({
                fill: "blue"
            });
        buttonCircle = s.circle(centerXNow, centerY, scale1o2)
            .attr({
                "id": HBNavigationStepByStep.BUTTON_PREV,
                "fillOpacity": 0,
                "stroke": "#333",
                "strokeWidth": 2
            });
        buttonCircle.that = this;
        buttonCircle.click(this.clickCallback);

        // buttons 0 to N
        for (let i = 0; i < this._count; i++) {
            centerXNow += scale;
            s.text(centerXNow, scale3o4 + 5, ("" + i))
                .attr({
                    "font": "30px source-sans-pro, Source Sans Pro, Helvetica, sans-serif",
                    "textAnchor": "middle"
                });
            buttonCircle = s.circle(centerXNow, centerY, scale1o2)
                .attr({
                    "id": i,
                    "opacity": 0.2, // @HB
                    // fillOpacity: 0,
                    "stroke": "#333",
                    "strokeWidth": 2,
                    // opacity: 0
                    "fill": HBNavigationStepByStep.FILL_UNSELECTED,
                    "class": HBNavigationStepByStep.CLASS_STATE
                });
            buttonCircle.that = this;
            buttonCircle.click(this.clickCallback);
        }

        // button Next
        centerXNow += scale;
        s.path(triangle)
            .transform("r180t" + (-centerXNow + triangleX) + ", " + (-centerY))
            .attr({
                "fill": "red"
            });
        buttonCircle = s.circle(centerXNow, centerY, scale1o2)
            .attr({
                "id": HBNavigationStepByStep.BUTTON_NEXT,
                "fillOpacity": 0.2, // @HB
                // fillOpacity: 0,
                "stroke": "#333",
                "strokeWidth": 2
            });
        buttonCircle.that = this;
        buttonCircle.click(this.clickCallback);
    } // setupGUIButtons

} // class HBNavigationStepByStep