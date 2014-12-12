// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');

// Create some Nodes, Lines and Circles
var A = new pad.Node(80, 100),
    B = new pad.Node(280, 300),
    C = new pad.Node(460, 200),
	P = new pad.Node(280, 100),
    AB = pad.Line.between(A, B),
    circleC = new pad.Circle.centerRadius(C, 101);

// Compute the projection of P on the Line and Circle
var PAB = pad.Point.projection(P, AB),
	PC = pad.Point.projection(P, circleC);

// Create a Line between the projections
var PABC = pad.Line.between(PAB, PC);

// Display and Tag all Points
pad.showPoints();
pad.tagPoints();
