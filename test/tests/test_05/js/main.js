var pad = new Sketchpad('sketchPadCanvas');

var r = pad.width > pad.height ? pad.height / 3 : pad.width / 3;

var p0 = new pad.Point(pad.width/2, pad.height/2),
	c0 = pad.Circle.centerRadius(p0, r);

var p1 = pad.Point.along(c0, 0.0),
	c1 = pad.Circle.centerRadius(p1, 0.9 * c0.r);

var p2 = pad.Point.along(c1, 0.0),
	c2 = pad.Circle.centerRadius(p2, 0.9 * c1.r);

var p3 = pad.Point.along(c2, 0.0),
	c3 = pad.Circle.centerRadius(p3, 0.9 * c2.r);


pad.update = function() {
	p3.setParameter(pad.frameCount / 1250);
	p2.setParameter(pad.frameCount / 2500);
	p1.setParameter(pad.frameCount / 5000);
};