// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// Construct a circle with a rotating line inside
var center = new pad.Node(pad.width.value / 2, pad.height.value / 2),
    circle = pad.Circle.centerRadius(center, 100);
    tip = pad.Point.along(circle, 0.0),
    hand = pad.Line.between(center, tip);

// Override sketch's update function with a custom updater
pad.update = function () {
    // Make sure to use object's methods to modify values
    // or changes won't replicate to children elements
    tip.setParameter(pad.frameCount / 500); 
    // tip.parameter = pad.frameCount / 500;  // this won't work
};