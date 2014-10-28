var pad = new Sketchpad('sketchPadCanvas');

var r = pad.width > pad.height ? pad.height / 3 : pad.width / 3;

var p0 = new pad.Point(pad.width/2, pad.height/2),
	c0 = pad.Circle.centerRadius(p0, r);

pad.invisible();
var c01 = pad.Circle.centerRadius(p0, 0.1 * r),
	p1 = pad.Point.along(c01, 0.0);
pad.visible();
var c1 = pad.Circle.centerRadius(p1, 0.9 * c0.r);

pad.invisible();
var c02 = pad.Circle.centerRadius(p1, 0.1 * c1.r),
	p2 = pad.Point.along(c02, 0.0);
pad.visible();
var c2 = pad.Circle.centerRadius(p2, 0.9 * c1.r);

pad.invisible();
var c03 = pad.Circle.centerRadius(p2, 0.1 * c2.r),
	p3 = pad.Point.along(c03, 0.0);
pad.visible();
var c3 = pad.Circle.centerRadius(p3, 0.9 * c2.r);

// c01.setVisible(false);
// p1.setVisible(false);
// c02.setVisible(false);
// p2.setVisible(false);
// c03.setVisible(false);
// p3.setVisible(false);

pad.update = function() {
	p1.setParameter(pad.frameCount / 2500);
	p2.setParameter(pad.frameCount / 1250);
	p3.setParameter(pad.frameCount / 625);
};	