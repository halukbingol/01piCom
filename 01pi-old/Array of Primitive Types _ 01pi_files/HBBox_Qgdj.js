// =====================
// HBBox.js
//

// when       who what
// 2018-05-02 HB init

class HBBox extends HBObjectDrawable {

    constructor(id, x, y, width, height, color) {
        super(id, x, y, color);
        this._width = width;
        this._height = height;
        // rectangle
        this._strokeWidthBox = 2;
        this._box = s.rect(this.x, this.y, this._width, this._height - 4)
            .attr({
                "stroke": this._color.peek(),
                "strokeWidth": this._strokeWidthBox, //_1,
                "fill": 'none',
                "opacity": 0.8
            });
        this._arrSnapObj.push(this._box);
        // text
        this._text = s.text(this.x + 5, this.y + 13, "")
            .attr({
                "font": "14px source-sans-pro, Source Sans Pro, Helvetica, sans-serif",
                // "font": heightFont + "px source-sans-pro, Source Sans Pro, Helvetica, sans-serif",
                "textAnchor": "start"
            });
        this._arrSnapObj.push(this._text);
        // path
        this._referredObject = new HBStack();
        this._referredObjectPath = new HBStack();
        this._referredObjectPath.push(HBBox.DEFAULT_PATH);
        this._path = s.path({
            "path": this._referredObjectPath.peek(),
            "fill": "none",
            "stroke": this._color.peek(),
            "strokeWidth": 3,
            "strokeLinecap": "round"
        });
        this._arrSnapObj.push(this._path);
        // content
        this._contentStack = new HBStack();
        this._isGarbage = new HBStack();
        this.setContent(true, "");

        //
        this.setVisible(false);
    } // constructor

    setContentColor(isForward, contentForward, color) {
        this.setContent(isForward, contentForward);
        this.setColor(isForward, color);
    } // setContentColor

    setColor(isForward, color) {
        super.setColor(isForward, color);
        this._box.attr({
            "stroke": this._color.peek()
        });
        this._text.attr({
            "stroke": this._color.peek()
        });
        this._path.attr({
            "stroke": this._color.peek()
        });
    } // setColor


    static get GARBAGE_PATTERN() {
        let sPath = s.path("M10-5-10,15M15,0,0,15M0-5-20,15")
            .attr({
                fill: "none",
                stroke: HBObjectDrawableArray.DEFAULT_COLOR_TYPE_GARBAGE,
                strokeWidth: 5
            });
        return sPath.pattern(0, 0, 10, 10);
    }

    setGarbage(isForward, trueFalse) {
        // let sPattern = 
        if (isForward) {
            this._isGarbage.push(trueFalse);
        } else {
            this._isGarbage.pop();
        }
        if (this._isGarbage.peek()) {
            this._box.attr({
                // "fill": sPattern,
                "fill": HBBox.GARBAGE_PATTERN,
                "fill-opacity": "0.5"
            });
        } else {
            this._box.attr({
                "fill": 'none',
                "fill-opacity": "1"
            });
        }
    } // setGarbage

    garbageCollected(isForward) {
        this.setColor(isForward,
            HBObjectDrawableArray.DEFAULT_COLOR_MEMORY
        );
        this.setContent(isForward,
            ""
        );
    } // garbageCollected

    getObject() {
        return this._referredObject.peek();
    } // getObject

    setObject(isForward, obj) {
        if (isForward) {
            this._referredObject.push(obj);
        } else {
            this._referredObject.pop();
        }
        if (this._referredObject.peek() == HBStack.STACK_UNDERFLOW) {
            this.setContent(isForward, "");
        } else {
            this.setContent(isForward,
                "@" + this._referredObject.peek().getLocation()
            );
        }
    } // setObject

    getContent() {
        return this._contentStack.peek();
    } // getContent

    setContent(isForward, contentForward) {
        if (isForward) {
            this._contentStack.push(contentForward);
        } else {
            this._contentStack.pop();
        }
        this._text.attr({
            "text": this._contentStack.peek()
        });
    } // setContent

    connectV2M(isForward, boxInB, dC1, dC2) {
        this.connectBox2Box(isForward, boxInB, "V2M", dC1, dC2);
    } // connectV2M


    connectM2M(isForward, objB, dC1, dC2) {
        this.connectBox2Box(isForward, objB, "M2M", dC1, dC2);
    } // connectM2M

    // bezier curve:
    //   stars at 'pOut', ends at 'pIn'
    //   with two control points 'c1' and 'c2'
    connectBox2Box(isForward, boxInB, mode, dC1, dC2) {
        if (isForward) {
            if (undefined == dC1) {
                dC1 = 0;
            }
            if (undefined == dC2) {
                dC2 = 0;
            }
            let deltaC1 = 30 + dC1;
            let deltaC2 = 30 + dC2;
            let pOut = this.getPointRight();
            let c1 = new HBGPoint(pOut.x + deltaC1, pOut.y);
            let pIn;
            let c2;
            let strArrowHead;
            if (mode == "M2M") {
                pIn = boxInB.getPointObject();
                c2 = new HBGPoint(pIn.x + deltaC2, pIn.y);
                strArrowHead =
                    "l " + HBBox.ARROW_WIDTH + " " + (-HBBox.ARROW_HEIGHT / 2) +
                    "l " + 0 + " " + HBBox.ARROW_HEIGHT +
                    "l " + (-HBBox.ARROW_WIDTH) + " " + (-HBBox.ARROW_HEIGHT / 2);
            } else {
                pIn = boxInB.getPointLeft();
                c2 = new HBGPoint(pIn.x - deltaC2, pIn.y);
                strArrowHead =
                    "l " + (-HBBox.ARROW_WIDTH) + " " + (-HBBox.ARROW_HEIGHT / 2) +
                    "l " + 0 + " " + HBBox.ARROW_HEIGHT +
                    "l " + HBBox.ARROW_WIDTH + " " + (-HBBox.ARROW_HEIGHT / 2);
            }
            this._referredObjectPath.push(
                "M " + pOut.x + " " + pOut.y +
                "C " +
                c1.x + " " + c1.y + "," +
                c2.x + " " + c2.y + "," +
                pIn.x + " " + pIn.y +
                strArrowHead
            );
            if (mode == "V2M") {
                this._path.attr({
                    "stroke-dasharray": "10, 5"
                });
            } else {
                // this._toBox = boxInB;
            }

        } else {
            this._referredObjectPath.pop();
            // this._path.attr({
            //     "path": this._referredObjectPath.peek()
            // })
        }
        this._path.attr({
            "path": this._referredObjectPath.peek()
        });
    } // connectBox2Box

    getPointObject() {
        let x = this.x + this._width;
        let y = this.y;
        return new HBGPoint(x, y);
    } // getPointRight

    getPointRight() {
        let x = this.x + this._width;
        let y = this.y + this._height / 2;
        return new HBGPoint(x, y);
    } // getPointRight

    getPointLeft() {
        let x = this.x;
        let y = this.y + this._height / 2;
        return new HBGPoint(x, y);
    } // getPointLeft

    setHighlight(trueFalse) {
        // @HB change color, too
        this._isHighlighted = trueFalse;
        let strokeWidth;
        let fontWeight;
        let color;
        if (this._isHighlighted) {
            strokeWidth = HBObjectDrawable.STROKE_WIDTH_HIGHLIGHTED;
            // fontWeight = "bold";
            // color = "#ffbd33";
            color = HBObjectDrawable.COLOR_HIGHLIGHT;
        } else {
            strokeWidth = HBObjectDrawable.STROKE_WIDTH_NORMAL;
            // fontWeight = "normal";
            color = this._color.peek();
        }
        this._box.attr({
            "strokeWidth": strokeWidth,
            "stroke": color
        });
        // this._text.attr({
        //     "font-weight": fontWeight
        // });
        this._path.attr({
            "strokeWidth": strokeWidth,
            "stroke": color
        });
    } // setHighlight

    // 
    static get DEFAULT_COLOR() { return "#bbb" };
    static get DEFAULT_PATH() { return "M 0 0 L 0 0"; };
    // 
    static get IN_LEFT() { return 0 };
    static get IN_RIGHT() { return 1 };
    // 
    static get ARROW_WIDTH() { return 6 };
    static get ARROW_HEIGHT() { return 4 };

    static setBoxTable(idPrefix, numOf, arrULx, arrULy, arrW, arrH, arrColor, title) {
        let arr = new Array();
        for (let i = 0; i < numOf; i++) {
            arr[i] = new HBBox(idPrefix + i, arrULx, arrULy + i * arrH, arrW, arrH, arrColor);
            arr[i].setColor(true, arrColor);
        }
        if (undefined == title) {
            title = "";
        }
        return new HBObjectDrawableArray(arr, title);
    } // setBoxTable

} // class HBBox