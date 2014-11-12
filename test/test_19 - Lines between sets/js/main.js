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


var pp0 = new pad.Point(100, 100),
	pp1 = new pad.Point(300, 100),
	ll = pad.Line.between(pp0, pp1),
	r = pad.Set.range(0, 1.0, 5),
	pps = pad.Point.along(ll, r);
red.applyTo(pp0, pp1);

var ppr0 = new pad.Point(100, 200),
	ppr1 = new pad.Point(300, 200),
	llr = pad.Line.between(ppr0, ppr1),
	rr = pad.Set.random(0, 1.0, 6),
	pppr = pad.Point.along(llr, rr);
red.applyTo(ppr0, ppr1);

var lines = pad.Line.between(pps, pppr);


var a0 = new pad.Point(400, 100),
	a1 = new pad.Point(600, 100),
	a2 = new pad.Point(400, 200),
	a3 = new pad.Point(600, 200),
	l0 = pad.Line.between(a0, a1),
	l1 = pad.Line.between(a2, a3);

var r1 = pad.Set.range(0, 1, 50),
	r2 = pad.Set.range(0, 1, 60);

var pp01 = pad.Point.along(l0, r1),
	pp02 = pad.Point.along(l1, r2),
	lines = pad.Line.between(pp01, pp02);

red.applyTo(a0, a1, a2, a3);
pp01.setVisible(false);  // this is not working, fix!



var p0 = new pad.Point(200, 300),
	p1 = new pad.Point(250, 300),
	d = pad.Measure.distance(p0, p1),
	c = pad.Circle.centerRadius(p0, d);
// p1.setStyle(red);
red.applyTo(p0, p1);

var rr = pad.Set.sequence(0, .1, 6),
	ppc = pad.Point.along(c, rr);

var pf = new pad.Point(200, 400),
	linesf = pad.Line.between(pf, ppc);
pf.setStyle(red);



pad.update = function() {
	// a1.move(-1, 1);
};