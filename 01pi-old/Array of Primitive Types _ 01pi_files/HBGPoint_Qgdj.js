// =====================
// HBGPoint.js
//

// when       who what
// 2018-05-02 HB init

class HBGPoint {

    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    set x(x) {
        this._x = x;
    }

    get y() {
        return this._y;
    }

    set y(y) {
        this._y = y;
    }

    toString() {
        return '[' + 'HBGPoint' +
            ' x:' + this._x +
            ' y:' + this._y +
            ']';
    }
} // class HBGPoint