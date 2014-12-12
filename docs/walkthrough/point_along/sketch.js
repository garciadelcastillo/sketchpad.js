// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// Create a Line between two Nodes
var A = new pad.Node(160, 200),
	B = new pad.Node(480, 200),
	AB = pad.Line.between(A, B);

// Create a Point at 3/4 the length of the Line, and use it as center of a Circle
var C = pad.Point.along(AB, 0.75),
    bigCircle = pad.Circle.centerRadius(C, 51); 

// Create a Point at 1/4 the length of that Circle, and draw another Circle
var D = pad.Point.along(bigCircle, 0.25),
	smallCircle = pad.Circle.centerRadius(D, 26);

// Display Tags only on Node elements
pad.tagNodes();