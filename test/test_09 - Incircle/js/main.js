var pad = new Sketchpad('sketchPadCanvas');

var A = new pad.Point(100, 100),
	B = new pad.Point(200, 200),
	C = new pad.Point(300, 100);

var a = pad.Measure.distance(B, C),
	b = pad.Measure.distance(C, A),
	c = pad.Measure.distance(A, B);

var AB = pad.Line.between(A, B),
	BC = pad.Line.between(B, C),
	CA = pad.Line.between(C, A);

// this can't be associative yet
var incenter = new pad.Point(0, 0),
	incircle = pad.Circle.centerRadius(incenter, 0);

incenter.setVisible(false);


pad.update = function() {
	// all this manual updating is EXACTLY what this library is trying to avoid...!
	var p = a.value + b.value + c.value,
		Ox = (a.value * A.x + b.value * B.x + c.value * C.x) / p,
		Oy = (a.value * A.y + b.value * B.y + c.value * C.y) / p;  // http://www.mathopenref.com/coordincenter.html

	var s = p / 2,
		r = Math.sqrt( (s - a.value) * (s - b.value) * (s - c.value) / s );  // http://mathworld.wolfram.com/Incircle.html (8)

	incenter.setPosition(Ox, Oy);
	incircle.setRadius(r);

};	