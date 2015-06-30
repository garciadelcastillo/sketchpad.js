// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');

var a = pad.var(100),
	b = a.half(),
	c = a.half(),
	d = pad.var(c);

var p1 = pad.point(100, 100);
var p2 = pad.point(a, 200);
var p3 = pad.point(a, b);


var x0 = pad.var(100),
	y0 = pad.var(100),
	x1 = x0.double(),
	y1 = y0.double();

var start = pad.point(x0, y0),
	end = pad.point(x1, y1);

var lineCoords = pad.line(x0, y0, x1, y1),
	linePoints = pad.line(start, end);