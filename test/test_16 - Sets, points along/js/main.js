var pad = new Sketchpad('sketchPadCanvas');


var red = new pad.Style({
	stroke: '#ff0000',
	strokeWidth: 1.0,
	fill: 'rgba(127, 0, 0, 0.5)'
});

var pp0 = new pad.Point(100, 400),
	pp1 = new pad.Point(200, 400),
	ll = pad.Line.between(pp0, pp1),
	r = pad.Set.range(0, 1.0, 7),
	pps = pad.Point.along(ll, r);
red.applyTo(pp0, pp1);

var p0 = new pad.Point(200, 200),
	p1 = new pad.Point(250, 200),
	d = pad.Measure.distance(p0, p1),
	c = pad.Circle.centerRadius(p0, d);
// p1.setStyle(red);
red.applyTo(p0, p1);

var rr = pad.Set.sequence(0, .1, 6),
	ppc = pad.Point.along(c, rr);



pad.update = function() {

};