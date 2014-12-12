// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

var C = new pad.Node(320, 200),
    P = new pad.Node(495, 200),
    CP = pad.Line.between(C, P);

// Create a Measure representing the distance between C and P
var R = pad.Measure.distance(C, P);

// Use the distance to create a Circle between the Points
var circle = pad.Circle.centerRadius(C, R);

// Compose an area Measure by passing parent references and callback
// Note how numeric measures are accesss through the .value property
var area = pad.Measure.compose(R, function () {
    return Math.PI * R.value * R.value;
});

// Add some Tags
var labelR = pad.Label.compose(R, function() {
        return 'R = ' + Math.round(R.value) + ' px';
    }),
    tagR = pad.Tag.on(CP, labelR);

var labelArea = pad.Label.compose(area, function() {
        return 'Area = ' + Math.round(area.value) + ' px';
    }),
    tagArea = pad.Tag.on(C, labelArea);


