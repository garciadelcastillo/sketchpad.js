var pad = new Sketchpad('sketchPadCanvas');

var p0 = new pad.Point(100, 100),
	p1 = new pad.Point(200, 200),
	l0 = pad.Line.between(p0, p1);

var p2 = new pad.Point(200, 100),
	proj = pad.Point.projection(p2, l0);


var pc = new pad.Point(300, 100),
	c = pad.Circle.centerRadius(pc, 26),
	projc = pad.Point.projection(p2, c);


pad.update = function() {

};