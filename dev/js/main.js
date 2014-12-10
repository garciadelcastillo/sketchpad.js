// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

// init Sketchpad
var pad = new Sketchpad('sketchPadCanvas');

// a free Node
var n0 = new pad.Node(100, 100);
n0.name = 'unconstrained Node';

// a Node that can only move horizontally
var nH = pad.Node.horizontal(250, 100);
nH.name = 'vertically-constrained Node'

// a Node that can only move vertically
var nV = pad.Node.vertical(400, 100);
nV.name = 'horizontally-contrained Node';

// a Node constrained (and clamped) to a Line
var A = new pad.Node(100, 200),
	B = new pad.Node(200, 300),
	AB = pad.Line.between(A, B);
var nAB = pad.Node.along(AB, 0.75, {clamp: true});
nAB.name = 'line-constrained + clamped Node';

// a Node constrained to a Circle
var C = new pad.Node(150, 400),
	circle = pad.Circle.centerRadius(C, 50);
var nCircle = pad.Node.along(circle, 0.75);
nCircle.name = 'circle-constrained Node';





pad.tagElementNames();

pad.update = function() {
	
};
