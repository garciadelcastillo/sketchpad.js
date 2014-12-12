// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// Create some Nodes and join them with Lines
var A = new pad.Node(100, 100),
    B = new pad.Node(540, 300),
    C = new pad.Node(540, 100),
    D = new pad.Node(100, 300),
    AB = pad.Line.between(A, B),
    CD = pad.Line.between(C, D);

// Compute the intersection of the Lines, and attach a Circle to it
var X = pad.Point.intersection(AB, CD),
	circleX = pad.Circle.centerRadius(X, 101);

// Compute intersections between Circle and Lines
var XAB = pad.Point.intersection(AB, circleX),
	XCD = pad.Point.intersection(CD, circleX);

// Display and Tag all Points
pad.showPoints();
pad.tagPoints();
