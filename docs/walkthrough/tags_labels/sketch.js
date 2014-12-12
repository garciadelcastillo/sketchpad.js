// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// Render a fixed text Tag on XY position
var title = new pad.Tag('This is a fixed Tag', 320, 40);

// Create a text Label linked to Node P
// Note how Label.compose takes as arguments all the elements
// the Label is child to, plus a callback function 
// returning the Label text string
var P = new pad.Node(320, 200);
var posLabel = pad.Label.compose(P, function() {
    return '[' + Math.round(P.x) + ', ' + Math.round(P.y) + ']';
});

// Now render a text Tag on Node P with text Label
var positionTag = pad.Tag.on(P, posLabel);

// Similarly, display Node distance to [0, 0]
var distLabel = pad.Label.compose(P, function() {
    var d = Math.sqrt(P.x * P.x + P.y * P.y);
    return 'This is a dynamic Tag. D = ' + Math.round(d) + ' px';
});
var anchor = new pad.Point(320, 375),
    distTag = pad.Tag.on(anchor, distLabel);

