// steps ==== V
let c_ind = 0;
const c_start = c_ind++;
const c_int_a = c_ind++; // int a;
const c_a__4 = c_ind++; // a = 4;
const c_int_b__5 = c_ind++; // int b = 5;
const c_int_c__7 = c_ind++; // int c = 7;
const c_c__8 = c_ind++; // c = 8;
const c_c__a = c_ind++; // c = a;
const c_c__9 = c_ind++; // c = 9;
const c_double_d = c_ind++; // double d;
const c_d__1p2 = c_ind++; // d = 1.2;
const c_d__a = c_ind++; // d = a;
const c_c__d = c_ind++; // c = d;
// steps ==== V

// object color codes
const colorInt = HBObjectDrawableArray.DEFAULT_COLOR_TYPE_PRIMITIVE;

// memory
const sizeM = 12;
let arrM = [];
let baseM = 0;
const bottomM = sizeM - 1;
// symbol table
const sizeS = 4;
let arrS = [];
let baseS = 0;
const bottomS = sizeS - 1;
// symbol and variable
//
const s_a = baseS++;
const v_a = baseM++;
//
const s_b = baseS++;
const v_b = baseM++;
//
const s_c = baseS++;
const v_c = baseM++;
//
const s_d = baseS++;
const v_d = baseM++;

// //
// let base;
// let arrS = [];
// let arrM = [];
// //
// let s_a = 0; // symbol
// let v_a = 1; // variable
// //
// let s_b = 1;
// let v_b = 3;
// //
// let s_c = 2;
// let v_c = 5;
// //
// let s_d = 3;
// let v_d = 8;
//

function stepByStepInit() {
  'use strict';
  s.attr({ viewBox: '0 0 300 300' });
  // ==== V
  // memory
  arrM = HBBox.setBoxTable(
    'M',
    sizeM, // sizeS,
    200, // sULx,
    10, // sULy,
    HBObjectDrawableArray.DEFAULT_W_MEMORY,
    HBObjectDrawableArray.DEFAULT_H,
    HBObjectDrawableArray.DEFAULT_COLOR_MEMORY,
    'memory',
  );
  // symbol table
  const sULx = 10;
  const sULy = 10;
  arrS = HBBox.setBoxTable(
    'S',
    sizeS,
    sULx,
    sULy,
    HBObjectDrawableArray.DEFAULT_W_ST,
    HBObjectDrawableArray.DEFAULT_H,
    HBObjectDrawableArray.DEFAULT_COLOR_ST,
    'symbol table',
  );
  //
  HBObjectDrawableArray.colorCoding(
    sULx,
    sULy + sizeS * HBObjectDrawableArray.DEFAULT_H,
    [['int', HBObjectDrawableArray.DEFAULT_COLOR_TYPE_PRIMITIVE]],
  );
  // ==== A
} // stepByStepInit

// ==========
// steps ==== V
// ==========
//
arrSteps[c_start] = function (hbPlusMinus, isForward) {
  'use strict';
  hbPlusMinus.setState(c_start, isForward);
  // visibility
  hbPlusMinus.setVisibility(
    isForward, //
    [arrS, arrM], //
    [],
  );
};
//
arrSteps[c_int_a] =
  // int a;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_int_a, isForward);
    // action
    HBObjectDrawableArray.declare(
      isForward,
      arrS,
      arrM,
      s_a,
      v_a,
      'int: a',
      colorInt,
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [
      arrS.location(s_a),
      arrM.location(v_a),
    ]);
  };
//
arrSteps[c_a__4] =
  // a = 4;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_a__4, isForward);
    // action
    HBObjectDrawableArray.assignLiteral(
      isForward,
      arrM,
      // a = 7;
      v_a,
      '4',
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [arrM.location(v_a)]);
  };
//
arrSteps[c_int_b__5] =
  // int b = 5;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_int_b__5, isForward);
    // action
    HBObjectDrawableArray.declareAssignPrimitive(
      isForward,
      arrS,
      arrM,
      // int a = 1;
      s_b,
      v_b,
      'int: b',
      colorInt,
      '5',
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [
      arrS.location(s_b),
      arrM.location(v_b),
    ]);
  };
//
arrSteps[c_int_c__7] =
  // int c = 7;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_int_c__7, isForward);
    // action
    HBObjectDrawableArray.declareAssignPrimitive(
      isForward,
      arrS,
      arrM,
      // int a = 1;
      s_c,
      v_c,
      'int: c',
      colorInt,
      '7',
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [
      arrS.location(s_c),
      arrM.location(v_c),
    ]);
  };

//
arrSteps[c_c__8] =
  // c = 8;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_c__8, isForward);
    // action
    HBObjectDrawableArray.assignLiteral(
      isForward,
      arrM,
      // a = 7;
      v_c,
      '8',
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [arrM.location(v_c)]);
  };
//
arrSteps[c_c__a] =
  // c = a;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_c__a, isForward);
    // action
    HBObjectDrawableArray.assignPrimitive2Primitive(
      isForward,
      arrM,
      // a = b; (int a, b)
      v_c,
      v_a,
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [arrM.location(v_c)]);
  };
//
arrSteps[c_c__9] =
  // c = 9;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_c__9, isForward);
    // action
    HBObjectDrawableArray.assignLiteral(
      isForward,
      arrM,
      // a = 7;
      v_c,
      '9',
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [arrM.location(v_c)]);
  };
//
arrSteps[c_double_d] =
  // double d;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_double_d, isForward);
    // action
    HBObjectDrawableArray.declare(
      isForward,
      arrS,
      arrM,
      s_d,
      v_d,
      'double: d',
      colorInt,
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [
      arrS.location(s_d),
      arrM.location(v_d),
    ]);
  };
//
arrSteps[c_d__1p2] =
  // d = 1.2;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_d__1p2, isForward);
    // action
    HBObjectDrawableArray.assignLiteral(
      isForward,
      arrM,
      // a = 7;
      v_d,
      '1.2',
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [arrM.location(v_d)]);
  };
//
arrSteps[c_d__a] =
  // d = a;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_d__a, isForward);
    // action
    HBObjectDrawableArray.assignPrimitive2Primitive(
      isForward,
      arrM,
      // a = b; (int a, b)
      v_d,
      v_a,
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [arrM.location(v_d)]);
  };
//
arrSteps[c_c__d] =
  // c = d;
  function (hbPlusMinus, isForward) {
    'use strict';
    hbPlusMinus.setState(c_c__d, isForward);
    // action
    HBObjectDrawableArray.assignLiteral(
      isForward,
      arrM,
      // a = 7;
      v_d,
      '?',
    );
    // highlight
    hbPlusMinus.setHighlight(isForward, [arrM.location(v_d)]);
  };
