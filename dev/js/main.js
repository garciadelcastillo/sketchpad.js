// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

// init Sketchpad
var pad = new Sketchpad('sketchPadCanvas');

var A = new pad.Node(100, 100),
	B = new pad.Node(200, 100);

// var AB = pad.Line.between(A, B),
// 	C = AB.center();

// var D = new pad.Node(50, 200),
// 	CD = pad.Line.between(C, D);

// var len = AB.length(),
// 	ang = AB.angle();

// var circ = pad.Circle.centerRadius(AB.start(), len);

var a = new pad.Point(100, 400),
	b = new pad.Point(200, 400);

var ab = pad.line(a, b);


var AB = pad.line(A, B);