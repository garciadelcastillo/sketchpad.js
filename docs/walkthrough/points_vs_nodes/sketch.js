// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// Create a Line between two Nodes, and two nested Circles
var A = new pad.Node(160, 120),
	B = new pad.Node(480, 120),
	AB = pad.Line.between(A, B);

var C = pad.Point.along(AB, 0.75),
    circleC = pad.Circle.centerRadius(C, 51); 

var D = pad.Point.along(circleC, 0.25),
	circleD = pad.Circle.centerRadius(D, 26);

// Now create the same setup, using Node elements as anchors instead
var M = new pad.Node(160, 280),
	N = new pad.Node(480, 280),
	MN = pad.Line.between(M, N);

var O = pad.Node.along(MN, 0.75, {clamp: true}),
	circleO = pad.Circle.centerRadius(O, 51);

var P = pad.Node.along(circleO, 0.25),
	circleP = pad.Circle.centerRadius(P, 26);

// Display Tags only on Node elements
pad.tagNodes();