// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// Create some Nodes and attach some Circles to them
var A = new pad.Node(270, 150),
    B = new pad.Node(370, 150),
    C = new pad.Node(320, 250),
    circleA = new pad.Circle.centerRadius(A, 51),
    circleB = new pad.Circle.centerRadius(B, 76),
    circleC = new pad.Circle.centerRadius(C, 101);

// Compute intersections between circles
var ABX = pad.Point.intersection(circleA, circleB),
	BCX = pad.Point.intersection(circleB, circleC),
	CAX = pad.Point.intersection(circleC, circleA);

// Display and Tag all Points
pad.showPoints();
pad.tagPoints();