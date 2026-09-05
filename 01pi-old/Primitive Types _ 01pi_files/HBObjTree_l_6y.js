// =====================
// HBObjTree.js
//

// when       who what
// 2018-05-02 HB init

class Referer extends HBObjectDrawable {

    constructor(id, x, y, text, color) {
        super(id, x, y, color);
        // this._text = text;
        let w = 20;
        let h = 20;
        // 
        let strPath = Referer.getStrPath(x, y, w, h);
        let path = s.path(strPath)
            .attr({
                "fill": "none",
                "stroke": this._color,
                "stroke-width": "2",
                "opacity": HBObjectDrawable.VISIBLE_NOT
            });
        this._arrSnapObj.push(path);
        //
        let label = s.text(
                x + w,
                y - h,
                text)
            .attr({
                "font": "30px source-sans-pro, Source Sans Pro, Helvetica, sans-serif",
                "textAnchor": "middle",
                "stroke": this._color,
                "stroke-width": "2",
                "opacity": HBObjectDrawable.VISIBLE_NOT
            });
        this._arrSnapObj.push(label);
    } // constructor

    setHighlight(stroke, strokeWidth) {
        if (stroke == HBObjectDrawable.COLOR_ORIGINAL) {
            stroke = this._color;
        }
        // path
        this._arrSnapObj[0].attr({
            "stroke": stroke,
            "stroke-width": strokeWidth
        });
        // label
        this._arrSnapObj[1].attr({
            "stroke": stroke,
            "stroke-width": strokeWidth
        });
    } // setHighlight

    static getStrPath(x, y, w, h) {
        let w1o2 = w / 2;
        let h1o3 = h / 3;
        let h2o3 = h1o3 + h1o3;
        let path =
            "M" + x + "," + y +
            "L" + (x + w1o2) + "," + (y - h1o3) +
            "L" + (x + w1o2) + "," + (y - h2o3) +
            "L" + (x + w) + "," + (y - h);
        return path;
    } // getStrTriangle

} // Referer




class Node extends HBObjectDrawable {

    constructor(id, x, y, text, color) {
        super(id, x, y, color);
        this._text = text;
        // 
        let circle = s.circle(
                this.x,
                this.y,
                15)
            .attr({
                "fill": color,
                "stroke": "#000",
                "opacity": HBObjectDrawable.VISIBLE_NOT
            });

        this._arrSnapObj.push(circle);
        //
        let label = s.text(
                this.x,
                this.y + 8,
                this._text)
            .attr({
                "font": "20px source-sans-pro, Source Sans Pro, Helvetica, sans-serif",
                "textAnchor": "middle",
                "stroke": "black",
                "stroke-width": "2",
                "opacity": HBObjectDrawable.VISIBLE_NOT
            });
        this._arrSnapObj.push(label);
    } // constructor

    setHighlight(stroke, strokeWidth) {
        if (stroke == HBObjectDrawable.COLOR_ORIGINAL) {
            stroke = this._color;
        }
        // circle
        this._arrSnapObj[0].attr({
            "stroke": stroke,
            "stroke-width": strokeWidth
        });
    } // setHighlight

} // Node




class Edge extends HBObjectDrawable {

    constructor(id, xA, yA, xB, yB, color) {
        super(id, xA, yA, color);
        // 
        this._xB = xB;
        this._yB = yB;
        //
        let line = s.line(this.x, this.y, this._xB, this._yB)
            .attr({
                "fill": this._color,
                "stroke": this._color,
                "stroke-width": "4",
                "opacity": HBObjectDrawable.VISIBLE_NOT
            });
        this._arrSnapObj.push(line);
    } // constructor

    setHighlight(stroke, strokeWidth) {
        if (stroke == HBObjectDrawable.COLOR_ORIGINAL) {
            stroke = this._color;
        }
        // line
        this._arrSnapObj[0].attr({
            "stroke": stroke,
            "stroke-width": strokeWidth
        });
    } // setHighlight

} // Edge




class Triangle extends HBObjectDrawable {

    constructor(id, x, y, w, h, color) {
        super(id, x, y, color);
        //
        let strTri = Triangle.getStrTriangle(x, y, w, h);
        let tri = s.path(strTri)
            // .transform("t" + x + "," + y)
            .attr({
                "fill": this._color,
                "opacity": HBObjectDrawable.VISIBLE_NOT
            });
        this._arrSnapObj.push(tri);
    } // constructor

    setHighlight(stroke, strokeWidth) {
        if (stroke == HBObjectDrawable.COLOR_ORIGINAL) {
            stroke = this._color;
        }
        // tri
        this._arrSnapObj[0].attr({
            "stroke": stroke,
            "stroke-width": strokeWidth
        });
    } // setHighlight

    static getStrTriangle(x, y, w, h) {
        let w1o2 = w / 2;
        let path =
            "M" + x + "," + y +
            "L" + (x - w1o2) + "," + (y + h) +
            "L" + (x + w1o2) + "," + (y + h) +
            "z";
        return path;
    } // getStrTriangle

} // Triangle