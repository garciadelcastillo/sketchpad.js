// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// .width and .height properties are accessible as Measures to inherit from
var label = pad.Label.compose(pad.width, pad.height, function() {
    return 'Canvas dimensions: ' + pad.width.value + 'x' + pad.height.value + ' px';
});

// Compose half Measures and attach a Circle on Canvas center
var halfWidth = pad.Measure.compose(pad.width, function () {
        return pad.width.value / 2;
    }),
    halfHeight = pad.Measure.compose(pad.height, function() {
        return pad.height.value / 2;
    });
var C = pad.Point.fromMeasures(halfWidth, halfHeight),
    circle = pad.Circle.centerRadius(C, 101);

// Display dimension on the center
var tag = pad.Tag.on(C, label);