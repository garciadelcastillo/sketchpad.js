var pad = new Sketchpad('sketchPadCanvas');

// line from coordinates
var line00 = pad.line(100, 100, 200, 100);

// line from nodes
var A = new pad.Node(100, 200),
	B = new pad.Node(200, 200);
var line01 = pad.line(A, B);  // overload for pad.line.between(), so should accept pointSets as well

// lines from static coordinates and point
var line02 = pad.line(100, 300, A),
	line03 = pad.line(B, 200, 300);

// polar lines
var C = new pad.Node(100, 400),
	line04 = pad.line.polar(C, 100, Math.PI / 4);

var D = new pad.Node(200, 400),
	len = Slider(pad, 300, 400, 100, 0, 200, 100),
	ang = Slider(pad, 300, 420, 100, 0, 2 * Math.PI, Math.PI/4),
	line05 = pad.line.polar(D, len, ang);



/**
 * Slider constructor with reworked line api
 */
function Slider(pad, x, y, width, minValue, maxValue, startValue) {
  var axis = pad.line(x, y, x + width, y),
      t = (startValue - minValue) / (maxValue - minValue),
      handle = pad.Node.along(axis, t, {clamp: true});
  var measure = pad.Measure.compose(handle, function() {
    return minValue + (maxValue - minValue) * (handle.x - x) / width;
  });
  var label = pad.Label.from(measure, {round: true}),
      tag = new pad.Tag.on(handle, label);
  return measure;
};