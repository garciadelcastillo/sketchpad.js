// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// Draw a circle with current default Style
var C1 = new pad.Node(128, 200),
    C1c = pad.Circle.centerRadius(C1, 100);

// Create a Style object
var beige = new pad.Style({
    stroke: 'rgb(224, 228, 204)',
    strokeWidth: 3.0,
    fill: 'rgba(224, 228, 204, 0.5)'
});

// From now on, draw elements with new Style
pad.currentStyle(beige);

// These new elements will use the new default style
var C2 = new pad.Node(256, 200),
    C2c = pad.Circle.centerRadius(C2, 100);

// More Styles
var aqua = new pad.Style({
        stroke: 'rgb(167, 219, 216)',
        strokeWidth: 3.0,
        fill: 'rgba(167, 219, 216, 0.5)'
    }),
    cyan = new pad.Style({
        stroke: 'rgb(105, 210, 231)',
        strokeWidth: 3.0,
        fill: 'rgba(105, 210, 231, 0.5)'
    });

// Still using 'reddish' for these
var C3 = new pad.Node(384, 200),
    C3c = pad.Circle.centerRadius(C3, 100),
    C4 = new pad.Node(512, 200),
    C4c = pad.Circle.centerRadius(C4, 100);

// Styles can be applied indivually to elements
aqua.applyTo(C3, C3c);
cyan.applyTo(C4, C4c);

// Font styling can also be defined, see docs for options
var arial12black = new pad.Style({
    stroke: 'black',
    fontFamily: 'Courier',
    fontSize: '9pt',
    fontStyle: 'bold',
    textHAlign: 'left', 
    textVAlign: 'top'
});

// Use new Style
pad.currentStyle(arial12black);
var title = new pad.Tag("Topleft aligned bold 9pt Courier", 10, 10);