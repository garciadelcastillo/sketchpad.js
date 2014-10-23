var pad = new Sketchpad('sketchPadCanvas');

var p0 = new pad.Point(150, 100),
	p1 = new pad.Point(150, 75),
	l0 = new pad.Line(p0, p1);

var p2 = new pad.Point(75, 83),
	c2 = new pad.Circle(p2, 26);

var p3 = new pad.Point(300, 75),
	r3 = new pad.Rectangle(p3, 100, 50);






pad.update = function() {
	p0.move(0.2, 0);
	p2.setPosition(100 + 50 * Math.sin(pad.frameCount / 50), p2.y);
};