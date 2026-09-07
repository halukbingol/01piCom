// =====================
// HBObjectDrawable.js
//

// when       who what
// 2018-05-02 HB init

class HBObjectDrawable {

    constructor(id, x, y, color) {
        this._id = id;
        this.x = x;
        this.y = y;
        this._color = new HBStack();
        if (undefined == color) {
            this._color.push(HBObjectDrawable.COLOR_DEFAULT);
        } else {
            this._color.push(color);
        }
        this._isDebugMode = false;
        this._isVisible = false;
        this._isHighlighted = false;
        this._isAnimation = false;
        this._isMoveable = true;
        this._arrSnapObj = new Array();
        this._trajectory = null;
        // this._trajectoryDelta = null;
        this._isForward = false;
    } // constructor

    getColor(){
        return this._color.peek();
    }

    setColor(isForward, color) {
        if (isForward) {
            this._color.push(color);
        } else {
            this._color.pop(color);
        }
    } // setColor

    setIsAnimation(trueFalse) {
        this._isAnimation = trueFalse;
    } // setColor

    setVisible(trueFalse) {
        this._isVisible = trueFalse;
        let opacity;
        if (this._isVisible) {
            opacity = HBObjectDrawable.VISIBLE;
        } else {
            opacity = HBObjectDrawable.VISIBLE_NOT;
            if (this._isDebugMode) {
                opacity = HBObjectDrawable.VISIBLE_DEBUG;
            }
        }

        for (var i = 0; i < this._arrSnapObj.length; i++) {
            this._arrSnapObj[i]
                .attr({
                    "opacity": opacity
                });
        }
    } // setVisible

    setHighlight(trueFalse) {
        this._isHighlighted = trueFalse;
        if (this._isHighlighted) {
            this.setHighlight(
                HBObjectDrawable.COLOR_HIGHLIGHT,
                HBObjectDrawable.STROKE_WIDTH_HIGHLIGHTED
            );
        } else {
            this.setHighlight(
                HBObjectDrawable.this._color.peek(),
                HBObjectDrawable.STROKE_WIDTH_NORMAL
            );
        }
    } // setHighlight

    setDebugMode(trueFalse) {
        this._isDebugMode = trueFalse;
    } // setDebugMode

    setForwardBackward(isForward) {
        this._isForward = isForward;
    } // setForwardBackward

    setTrajectory(trajectory) {
        this._trajectory = trajectory;
    } // setTrajectory

    setForwardBackwardTrajectory(isForward, trajectory) {
        this._isMoveable = true;
        this.setForwardBackward(isForward);
        this.setTrajectory(trajectory);
    } // setForwardBackwardTrajectory

    draw(s) {
        if (this._isAnimation) {
            this.animate(this._isForward);
        }
        // else {
        //     this.standStill(s);
        // }
    } // draw

    // standStill(s) {
    //     this.standStillDraw(s);
    // }

    animate(isForward) {
        'use strict';
        if (!this._isMoveable) {
            return;
        } else {
            this._isMoveable = false;
        }
        let trajectory = this._trajectory;
        if (null == trajectory) {
            console.log("**E** HBObjectDrawable.hbAnimate: trajectory null.");
            return;
        } else if (!trajectory) {
            console.log("**E** HBObjectDrawable.hbAnimate: '!trajectory'.");
            return;
        }
        let trajectoryLength = trajectory.getTotalLength();
        for (let i = 0; i < this._arrSnapObj.length; i++) {
            let objSnap = this._arrSnapObj[i];
            let from;
            let to;
            if (trajectoryLength == 0) {
                // no animation
                let p = trajectory.getPointAtLength(trajectoryLength);
                objSnap.attr({ transform: "T" + p.x + "," + p.y });
            } else {
                // animation
                if (isForward) {
                    from = 0;
                    to = 1;
                } else {
                    from = 1;
                    to = 0;
                }
                Snap.animate(
                    from,
                    to,
                    function(t) {
                        if (!trajectory) {
                            objSnap.attr({ transform: "T0,0" });
                            return;
                        }
                        let trajectoryLength = trajectory.getTotalLength();
                        let p = trajectory.getPointAtLength(t * trajectoryLength);
                        objSnap.attr({ transform: "T" + p.x + "," + p.y });
                    },
                    2e3,
                    mina.easeinout
                );
            }
        }
    } // animate

    // opacity
    static get VISIBLE() { return "1"; }
    static get VISIBLE_NOT() { return "0" } // production
    static get VISIBLE_DEBUG() { return "0.2"; } // development
    // 
    static get STROKE_WIDTH_NORMAL() { return 2; }
    static get STROKE_WIDTH_HIGHLIGHTED() { return 4; }
    // 
    static get COLOR_DEFAULT() { return "#bbb"; }
    static get COLOR_HIGHLIGHT() { return "#ffbd33"; }
    static get COLOR_ORIGINAL() { return -1; }

    static drawArrDrawable(s, arrDrawable) {
        // s.clear();
        for (let i = 0; i < arrDrawable.length; i++) {
            arrDrawable[i].draw(s);
        }
    } // drawArrdrawable

} // HBObjectDrawable