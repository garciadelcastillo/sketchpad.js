/**
 * A quick implementation of a Slider class
 * Returns a Measure object defined by the slider's state
 */
function Slider(pad, x, y, width, minValue, maxValue, startValue) {
  var axis = new pad.Line(x, y, x + width, y),
      t = (startValue - minValue) / (maxValue - minValue),
      handle = pad.Node.along(axis, t, {clamp: true});
  var measure = pad.Measure.compose(handle, function() {
    return minValue + (maxValue - minValue) * (handle.x - x) / width;
  });
  var label = pad.Label.from(measure, {round: true}),
      tag = new pad.Tag.on(handle, label);
  return measure;
};

// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// Create a Measure object through the Slider interface
var radius = Slider(pad, 25, 25, 150, 0, 300, 150);

// Now use the slider's Measure as radius for a circle
var center = new pad.Node(pad.width.value / 2, pad.height.value / 2),
    circle = pad.Circle.centerRadius(center, radius);