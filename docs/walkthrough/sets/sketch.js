// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// Create some Lines and Circles
var A = new pad.Node(128, 100),
    B = new pad.Node(256, 300),
    C = new pad.Node(512, 100),
    D = new pad.Node(384, 300),
    E = new pad.Node(320, 100),
    AB = pad.Line.between(A, B),
    DC = pad.Line.between(D, C),  // note orientation change here
    circleE = pad.Circle.centerRadius(E, 50);

// Create a Set of numbers with 100 steps from 0 to 1
var divs = pad.Set.range(0, 1, 100);

// Use those values to create Point Sets along Lines and Circles
var ABpts = pad.Point.along(AB, divs),
    DCpts = pad.Point.along(DC, divs),
    circleEpts = pad.Point.along(circleE, divs);

// Apply new Style
pad.currentStyle( new pad.Style({ stroke: 'rgba(127, 127, 127, 0.3' }) );

// Create Line Sets between Point Sets
var lineToLine = pad.Line.between(ABpts, DCpts),
    lineToCircle = pad.Line.between(DCpts, circleEpts);