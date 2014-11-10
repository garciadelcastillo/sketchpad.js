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


var pp0 = new pad.Point(100, 400),
	pp1 = new pad.Point(200, 400),
	ll = pad.Line.between(pp0, pp1),
	r = pad.Set.range(0, 1.0, 7),
	pps = pad.Point.along(ll, r);

pp0.setVisible(false);
pp1.setVisible(false);


pad.update = function() {

};
