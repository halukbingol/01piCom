// =====================
// HBBoxObject.js
//

// when       who what
// 2018-06-12 hb init

class HBBoxObject extends HBBox {

    getLocation() {
        return this._location;
    }

    getColor() {
        return this._color.peek();
    }

    static Factory(arrM, id, location, length, color) {
        // let loc0 = arrM.item(0);
        // // 
        // let deltaX = 14;
        // let x = loc0.x - deltaX;
        // let y = loc0.y + location * loc0._height;
        let loc0 = arrM.item(location);
        // 
        let deltaX = 14;
        let x = loc0.x - deltaX;
        let y = loc0.y;
        let w = loc0._width + 2 * deltaX;
        let h = loc0._height * length;
        let object = new HBBoxObject(id, x, y, w, h, color);
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
            object._arrSnapObj.push(text);
        }
        object._location = location;
        object.setVisible(false);
        // loc0.setObject(true, object);
        return object;
    } // getObjectBox

} // class HBBox