// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');



// var a = pad.number(100),
// 	a2 = a.half();

// var X = pad.number(200),
// 	Y = pad.number(200);

// var P1 = pad.point(100, 100),
// 	P2 = pad.point(X, Y);

// var line1 = pad.line(400, 100, 500, 150),
// 	line2 = pad.line(P1, P2);

// var pLine2 = line2.pointAt(0.5);

// var A = pad.node(300, Y),
// 	line3 = pad.line(A, P2);

// X.add(50) is constrained!!


// pad.update = function () {
// 	X.add(0.1);
// }










var A = pad.node(100, 100),
	B = pad.node(200, 100);
var AB = pad.line(A, B);
var C = AB.pointAt(0.50);


















