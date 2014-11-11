// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');

// var pa = new pad.Point(100, 50),
// 	pb = new pad.Point(200, 50),
// 	d = pad.Measure.distance(pa, pb);

// var ps = new pad.Point(100, 75),
// 	lp = pad.Line.polar(ps, d, 0);

// var p0 = new pad.Point(100, 100),
// 	p1 = new pad.Point(200, 200),
// 	l = pad.Line.between(p0, p1);

// var pt = pad.Point.along(l, d);

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

// var ppp = pad.Point.along(c, d);
// blue.applyTo(ppp);


var a0 = new pad.Point(50, 50),
	a1 = new pad.Point(100, 50),
	a2 = new pad.Point(50, 100);
var alpha = pad.Measure.angle(a0, a1, a2);

var s0 = new pad.Point(150, 50),
	ls0 = pad.Line.polar(s0, 50, alpha);

pad.update = function() {

};
