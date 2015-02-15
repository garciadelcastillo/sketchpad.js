var pad = new Sketchpad('sketchPadCanvas');


var red = new pad.Style({
	stroke: '#ff0000',
	strokeWidth: 1.0,
	fill: 'rgba(127, 0, 0, 0.5)'
});

var a0 = new pad.Point(50, 50),
	a1 = new pad.Point(100, 50),
	a2 = new pad.Point(50, 100);
var alpha = pad.Measure.angle(a0, a1, a2),
	d = pad.Measure.distance(a0, a2);

var s0 = new pad.Point(150, 50),
	ls0 = pad.Line.polar(s0, 50, alpha);

var s1 = new pad.Point(200, 50),
	ls1 = pad.Line.polar(s1, d, alpha);

red.applyTo(a0, a1, a2, s0, s1);

pad.update = function() {

};