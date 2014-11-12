var pad = new Sketchpad('sketchPadCanvas');

// STYLES
var red = new pad.Style({
	stroke: '#ff0000',
	strokeWidth: 1.0,
	fill: 'rgba(127, 0, 0, 0.5)'
});
var blue = new pad.Style({
	stroke: '#0000ff',
	strokeWidth: 1.0,
	fill: 'rgba(0, 0, 127, 0.5)'
});

var pc0 = new pad.Point(200, 100),
	pc1 = new pad.Point(200, 150),
	pc2 = new pad.Point(200, 200),
	c0 = pad.Circle.centerRadius(pc0, 80),
	c1 = pad.Circle.centerRadius(pc1, 90),
	c2 = pad.Circle.centerRadius(pc2, 100);
red.applyTo(pc0, pc1, pc2);

var int01 = pad.Point.intersection(c0, c1),
	int12 = pad.Point.intersection(c1, c2),
	int02 = pad.Point.intersection(c0, c2);

var ll0 = pad.Line.between(int01, int12),
	ll1 = pad.Line.between(int01, int02),
	ll2 = pad.Line.between(int02, int12);

pad.findElementNames();


pad.update = function() {
	
};
