var pad = new Sketchpad('sketchPadCanvas');

// INTERSECTIONS
var p0 = new pad.Point(100, 100),
	p1 = new pad.Point(400, 200),
	p2 = new pad.Point(100, 200),
	p3 = new pad.Point(400, 100);
var l01 = pad.Line.between(p0, p1),
	l23 = pad.Line.between(p2, p3);
var pint = pad.Point.intersection(l01, l23);

var c1 = pad.Circle.centerRadius(pint, 50);
var pc0 = pad.Point.intersection(l01, c1),
	pc1 = pad.Point.intersection(l23, c1);

var pp = new pad.Point(550, 150),
	c2 = pad.Circle.centerRadius(pp, 50);
var ppc0 = pad.Point.intersection(l01, c2),
	ppc1 = pad.Point.intersection(l23, c2);

pad.update = function() {

};