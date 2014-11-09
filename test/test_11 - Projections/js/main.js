var pad = new Sketchpad('sketchPadCanvas');

// INTERSECTIONS
var p0 = new pad.Point(100, 100),
	p1 = new pad.Point(400, 200),
	p2 = new pad.Point(100, 200),
	p3 = new pad.Point(400, 100);

var l01 = pad.Line.between(p0, p1),
	l23 = pad.Line.between(p2, p3);

var pint = pad.Point.intersection(l01, l23);

// parallel test
var p10 = new pad.Point(100, 300),
	p11 = new pad.Point(400, 300),
	p12 = new pad.Point(100, 400),
	p13 = new pad.Point(400, 400);
var lineA = pad.Line.between(p10, p11),
	lineB = pad.Line.between(p12, p13);
pint2 = pad.Point.intersection(lineA, lineB);


pad.update = function() {

};