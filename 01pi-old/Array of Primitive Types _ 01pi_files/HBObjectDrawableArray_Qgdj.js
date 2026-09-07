// =====================
// HBObjectDrawableArray.js
//

// when       who what
// 2018-05-02 HB init

class HBObjectDrawableArray {

    constructor(arr, title) {
        this.arrObjectDrawable = arr;
        this.lineNumber = HBObjectDrawableArray.getLineNumbers(this);
        if (undefined == title) {
            title = "";
        }
        this.odTitle = new HBObjectDrawable(title, 0, 0, "red");
        let obj = arr[0];
        let sText = s.text(obj.x, obj.y - 4, title)
            .attr({
                "font": "8px source-sans-pro, Source Sans Pro, Helvetica, sans-serif",
                "textAnchor": "start",
                "font-weight": "normal",
                "opacity": "0"
            });
        this.odTitle._arrSnapObj.push(sText);
    } // constructor

    setColor(isForward, color) {
        for (let i = 0; i < this.arrObjectDrawable.length; i++) {
            this.arrObjectDrawable[i].setColor(isForward, color);
        }
        this.odTitle.setColor(isForward, color);
    } // setColor

    setIsAnimation(trueFalse) {
        for (let i = 0; i < this.arrObjectDrawable.length; i++) {
            this.arrObjectDrawable[i].setIsAnimation(trueFalse);
        }
    } // setColor

    setVisible(trueFalse) {
        for (let i = 0; i < this.arrObjectDrawable.length; i++) {
            this.arrObjectDrawable[i].setVisible(trueFalse);
        }
        this.lineNumber.setVisible(trueFalse);
        this.odTitle.setVisible(trueFalse);
    } // setVisible

    setHighlight(trueFalse) {
        for (let i = 0; i < this.arrObjectDrawable.length; i++) {
            this.arrObjectDrawable[i].setHighlight(trueFalse);
        }
    } // setHighlight

    setDebugMode(trueFalse) {
        for (let i = 0; i < this.arrObjectDrawable.length; i++) {
            this.arrObjectDrawable[i].setDebugMode(trueFalse);
        }
    } // setDebugMode

    setForwardBackward(forwardBackward) {
        for (let i = 0; i < this.arrObjectDrawable.length; i++) {
            this.arrObjectDrawable[i].setForwardBackward(forwardBackward);
        }
    } // setForwardBackward

    setTrajectory(trajectory) {
        for (let i = 0; i < this.arrObjectDrawable.length; i++) {
            this.arrObjectDrawable[i].setTrajectory(trajectory);
        }
    } // setTrajectory

    setForwardBackwardTrajectory(forwardBackward, trajectory) {
        for (let i = 0; i < this.arrObjectDrawable.length; i++) {
            this.arrObjectDrawable[i].setForwardBackwardTrajectory(forwardBackward, trajectory);
        }
    } // setForwardBackwardTrajectory

    draw(s) {
        for (let i = 0; i < this.arrObjectDrawable.length; i++) {
            this.arrObjectDrawable[i].draw(s);
        }
    } // draw

    location(i) {
        return this.item(i);
    } // location

    item(i) {
        return this.arrObjectDrawable[i];
    } // item

    length() {
        return this.arrObjectDrawable.length;
    } // length

    // ============
    // object stuff
    // ============
    getObjectBox(isForward, id, location, length, color) {
        // @HB do better with HBBox.getLineNumbers
        if (isForward) {
            let loc0 = this.item(0);
            // 
            let deltaX = 14;
            let x = loc0.x - deltaX;
            let y = loc0.y + location * loc0._height;
            let w = loc0._width + 2 * deltaX;
            let h = loc0._height * length;
            let box = new HBBoxObject(id, x, y, w, h, color);
            // line numbers
            for (let i = 0; i < length; i++) {
                let text = s.text(
                        loc0.x + loc0._width + 5,
                        y + loc0._height * i + 13,
                        String(i)
                    )
                    .attr({
                        "font": "8px source-sans-pro, Source Sans Pro, Helvetica, sans-serif",
                        "textAnchor": "start",
                        "stroke": color
                    });
                box._arrSnapObj.push(text);
            }
            box.setVisible(false);
            return box;
        } else {
            // nop
        }
    } // getObjectBox

    // // ==============
    // // works on arrST and arrM
    // // ==============
    // setContent(isForward, v_a, text) {
    //     this.location(v_a).setContent(isForward,
    //         text
    //     );
    // } // setContent


    // // ==============
    // // works on arrST
    // // ==============


    // declarePrimitive(isForward, s_a, v_a, text, arrM) {
    //     this.declareObject(isForward, s_a, v_a, text, arrM,
    //         HBObjectDrawableArray.DEFAULT_COLOR_TYPE_PRIMITIVE
    //     );
    // } // declarePrimitive

    // declareSetPrimitive(isForward, s_a, v_a, text, arrM, value) {
    //     this.declarePrimitive(isForward, s_a, v_a, text, arrM);
    //     arrM.setContent(isForward,
    //         v_a, text
    //     );
    // } // declareSetPrimitive

    // declareSetLiteral(isForward, s_a, obj, text, arrM, value, color) {
    //     // let v_a = obj.getLocation();
    //     this.declareObject(isForward, s_a, obj, text, arrM,
    //         color
    //     );
    //     arrM.setContent(isForward,
    //         v_a, value
    //     );
    // } // declareSetLiteral

    // declareObject(isForward, s_a, obj, text, arrM, color) {
    //     let v_a = obj.getLocation();
    //     // ObjectA a;
    //     this.location(s_a).setColor(isForward,
    //         color
    //     );
    //     this.location(s_a).setContent(isForward,
    //         text
    //     );
    //     this.location(s_a).connectV2M(isForward,
    //         arrM.location(v_a)
    //     );
    //     arrM.location(v_a).setColor(isForward,
    //         color
    //     );
    //     arrM.location(v_a).setContent(isForward,
    //         HBObjectDrawableArray.CONTENT_UNINITIALIZED
    //     );
    // } // declareObject

    // declareNewObject(isForward, s_a, v_a, text, arrM, o_x, dC1, dC2) {
    //     // ObjectA a = new ObjectA(..);
    //     this.declareObject(isForward, s_a, v_a, text, arrM, o_x.getColor());
    //     arrM.objectAssignNew(isForward, v_a, o_x, dC1, dC2);
    // }

    // // ==============
    // // works on arrM
    // // ==============

    // primitiveAssignLiteral(isForward, v_a, literal) {
    //     // primitive_a = primitive_b;
    //     arrM.setContent(isForward, v_a, literal);
    // }

    // primitiveAssign(isForward, v_a, v_b) {
    //     // primitive_a = primitive_b;
    //     this.location(v_a).setContent(isForward,
    //         this.location(v_a).getContent()
    //     );
    // }

    // objectAssignNew(isForward, v_a, object, dC1, dC2) {
    //     // obj_a = new ObjectA(..);
    //     this.location(v_a).setColor(isForward,
    //         object.getColor()
    //     );

    //     this.location(v_a).connectM2M(isForward,
    //         object,
    //         dC1,
    //         dC2
    //     );
    //     this.location(v_a).setObject(isForward,
    //         object
    //     );
    // }

    // objectAssign(isForward, v_a, v_b, dC1, dC2) {
    //     // obj_a = obj_b;
    //     arrM.objectAssignNew(isForward,
    //         v_a,
    //         this.location(v_b).getObject(),
    //         dC1,
    //         dC2
    //     );
    // }

    // newObject(isForward, v_a, o_obj, literal) {
    //     // v_a = new Coor1D(literal)
    //     let loc = o_obj.getLocation();
    //     arrM.objectAssignNew(isForward,
    //         v_a,
    //         o_obj
    //     );
    //     arrM.primitiveAssignLiteral(isForward,
    //         loc,
    //         literal
    //     );
    //     return loc;
    // }

    static get DEFAULT_H() { return 20 };
    static get DEFAULT_W_MEMORY() { return 40 };
    static get DEFAULT_W_ST() { return 120 };
    static get CONTENT_UNDEFINED() { return "u" };
    static get CONTENT_UNINITIALIZED() { return "-" };
    static get CONTENT_QUESTION() { return "?" };
    // https://www.w3schools.com/colors/colors_picker.asp?colorhex=808080
    // "lightblue"  "lightgrey"
    static get DEFAULT_COLOR_MEMORY() { return "darkgrey" };
    static get DEFAULT_COLOR_ST() { return "darkgrey" };
    static get DEFAULT_COLOR_TYPE_PRIMITIVE() { return "#003300" }; // 9999ff
    static get DEFAULT_COLOR_TYPE_STRING() { return "#ff8093" }; // pink
    static get DEFAULT_COLOR_TYPE_ARRAY() { return "#ffd700" };
    // static get DEFAULT_COLOR_TYPE_OBJECT_1() { return "#ffbf00" };
    static get DEFAULT_COLOR_TYPE_OBJECT_1() { return "#00e600" };
    static get DEFAULT_COLOR_TYPE_OBJECT_2() { return "#ff00ff" };
    static get DEFAULT_COLOR_TYPE_OBJECT_3() { return "#ff8000" };
    static get DEFAULT_COLOR_TYPE_GARBAGE() { return "#d9d9d9" }; // b3b3b3 bada55

    static getLineNumbers(arrObj) {
        // @HB do better with HBObjectDrawableArray.getObjectBox
        let lineNumbers = new HBObjectDrawable("lineNo", 0, 0, "red");
        for (let i = 0; i < arrObj.length(); i += 2) {
            let obj = arrObj.arrObjectDrawable[i];
            let text = s.text(obj.x - 5, obj.y + 13, String(i))
                .attr({
                    "font": "8px source-sans-pro, Source Sans Pro, Helvetica, sans-serif",
                    "textAnchor": "end",
                    "font-weight": "normal",
                    // "opacity": "0.3"
                    "opacity": "0"
                });
            lineNumbers._arrSnapObj.push(text);
        }
        return lineNumbers;
    } // getLineNumbers

    static colorCoding(x, y, arrColorCode) {
        let row = 0;
        const indxString = 0;
        const indxColor = 1;
        const sizeSquare = HBObjectDrawableArray.DEFAULT_H - 10;
        const sizeRow = sizeSquare + 3;
        const textDisplacement = sizeSquare;
        s.text(
                x,
                y + row * sizeSquare + textDisplacement,
                "color coding table"
            )
            .attr({
                "font": "8px source-sans-pro, Source Sans Pro, Helvetica, sans-serif",
                "textAnchor": "start"
            });
        for (let i = 0; i < arrColorCode.length; i++) {
            row++;
            s.rect(
                    x,
                    y + row * sizeRow,
                    sizeSquare,
                    sizeSquare
                )
                .attr({
                    "stroke": HBObjectDrawableArray.DEFAULT_COLOR_ST,
                    "strokeWidth": 1,
                    "fill": arrColorCode[i][indxColor],
                    "opacity": 1
                });
            s.text(
                    x + sizeSquare + 4,
                    y + row * sizeRow + textDisplacement,
                    arrColorCode[i][indxString]
                )
                .attr({
                    "font": "8px source-sans-pro, Source Sans Pro, Helvetica, sans-serif",
                    "textAnchor": "start"
                });
        }
    } // colorCoding

    // ================

    // basics
    // arrST
    static declare(isForward, arrS, arrM,
        // ObjectA a;
        s_a,
        v_a,
        sText,
        colorType
    ) {
        arrS.location(s_a).setColor(isForward,
            colorType
        );
        arrS.location(s_a).setContent(isForward,
            sText
        );
        arrM.location(v_a).setColor(isForward,
            colorType
        );
        arrM.location(v_a).setContent(isForward,
            HBObjectDrawableArray.CONTENT_UNINITIALIZED
        );
        arrS.location(s_a).connectV2M(isForward,
            arrM.location(v_a)
        );
    }
    // arrM
    static assignLiteral(isForward, arrM,
        // a = 7;
        v_a,
        value
    ) {
        arrM.location(v_a).setContent(isForward,
            value
        );
    }
    // arrM
    static assignPrimitive2Primitive(isForward, arrM,
        // a = b; (int a, b)
        v_a,
        v_b
    ) {
        arrM.location(v_a).setContent(isForward,
            arrM.location(v_b).getContent()
        );
    }
    // arrM
    static assignObject2Object(isForward, arrM,
        // a = b; (ObjectA a, b)
        v_a,
        v_b,
        dC1,
        dC2
    ) {
        let obj = arrM.location(v_b).getObject();
        HBObjectDrawableArray.assign2Object(isForward, arrM,
            v_a,
            obj,
            dC1,
            dC2
        )
    }
    // arrM
    static assign2Object(isForward, arrM,
        // a = new ObjcetA(..);
        v_a,
        obj,
        dC1,
        dC2
    ) {
        arrM.location(v_a).connectM2M(isForward,
            obj,
            dC1,
            dC2
        );
        arrM.location(v_a).setObject(isForward,
            obj
        );
    }

    // drived ====
    static declareAssignPrimitive(isForward, arrS, arrM,
        // int a = 1;
        s_a,
        v_a,
        sText,
        colorType,
        value
    ) {
        HBObjectDrawableArray.declare(isForward, arrS, arrM,
            // ObjectA a;
            s_a,
            v_a,
            sText,
            colorType
        );
        arrM.location(v_a).setContent(isForward,
            value
        );
    }

    static declareAssign2Object(isForward, arrS, arrM,
        // ObjectA a = new ObjcetA(..);
        s_a,
        v_a,
        sText,
        colorType,
        obj,
        dC1,
        dC2
    ) {
        HBObjectDrawableArray.declare(isForward, arrS, arrM,
            // ObjectA a;
            s_a,
            v_a,
            sText,
            colorType
        );
        HBObjectDrawableArray.assign2Object(isForward, arrM,
            // a = new ObjcetA(..);
            v_a,
            obj,
            dC1,
            dC2
        );
    }

    static literalString(isForward, arrS, arrM,
        // "A"
        s_a,
        sText,
        v_a,
        obj,
        oText,
        colorType,
        dC1,
        dC2
    ) {
        HBObjectDrawableArray.declareAssign2Object(isForward, arrS, arrM,
            // ObjectA a = new ObjcetA(..);
            s_a,
            v_a,
            sText,
            colorType,
            obj,
            dC1,
            dC2
        );
        arrM.location(obj.getLocation()).setContentColor(isForward,
            oText,
            colorType
        );
    }

} // HBObjectDrawableArray