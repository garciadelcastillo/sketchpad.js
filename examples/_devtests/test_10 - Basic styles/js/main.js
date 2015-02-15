var pad = new Sketchpad('sketchPadCanvas');

// set styles
var regular = new pad.Style({
	stroke: '#000',
	strokeWidth: 1.0,
	fill: 'rgba(0, 0, 0, 0)'
});

var reddish = new pad.Style({
	stroke: '#ff0000',
	strokeWidth: 2.0,
	fill: 'rgba(127, 0, 0, 0.5)'
});

var bluish = new pad.Style({
	stroke: '#0000ff',
	strokeWidth: 2.0,
	fill: 'rgba(0, 0, 127, 0.5)'
});

// set current pad's style to regular
pad.currentStyle(regular);

// construct geometry
var p0 = new pad.Point(100, 100),
	p1 = new pad.Point(150, 100),
	d = pad.Measure.distance(p0, p1),
	l01 = pad.Line.between(p0, p1);

// set another style and keep drawing
pad.currentStyle(bluish);
var pc = new pad.Point(400, 100),
	c = pad.Circle.centerRadius(pc, d),
	lc = pad.Line.between(pc, pad.Point.along(c, 0.125));
	// lc = pad.Line.polar(pc, d, pad.toRadians(45));

// now, change style for individual elements
reddish.applyTo(l01, lc);


pad.update = function() {

};