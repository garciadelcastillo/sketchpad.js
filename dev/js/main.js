var pad = new Sketchpad('sketchPadCanvas');

var p0 = new pad.Point(100, 100),
	p1 = new pad.Point(150, 100);

var d = pad.Measure.distance(p0, p1);

var pc = new pad.Point(400, 100),
	c = pad.Circle.centerRadius(pc, d);





pad.update = function() {

};