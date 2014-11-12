var pad = new Sketchpad('sketchPadCanvas');

// STYLES
var red = new pad.Style({
	stroke: '#ff0000',
	strokeWidth: 1.0,
	fill: 'rgba(127, 0, 0, 0.5)'
});

var blue = new pad.Style({
	stroke: 'none',
	strokeWidth: 1.0,
	fill: 'rgba(0, 0, 127, 0.5)'
});

// PROJECTIONS
var p0 = new pad.Point(100, 100),
	p1 = new pad.Point(200, 200),
	p2 = new pad.Point(200, 100),
	l01 = pad.Line.between(p0, p1),
	pc = new pad.Point(300, 150),
	c = pad.Circle.centerRadius(pc, 50);

var projLine = pad.Point.projection(p2, l01),
	projCircle = pad.Point.projection(p2, c);

red.applyTo(p0, p1, p2, pc);
blue.applyTo(projLine, projCircle);

pad.update = function() {

};