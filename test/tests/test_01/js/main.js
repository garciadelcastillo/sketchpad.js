
// var pad = new Sketchpad.Canvas('sketchpad');  // create a new instance of a Sketchpad object to draw in

sketchpad.initialize('sketchpad');

sketchpad.setup = function() {
	p1 = new Point(200, 300);
	p2 = new Point(400, 500);
	line1 = new Line(p1, p2);
	p3 = new PointAt(line1, 0.5);

	c1 = new Circle(p1, 26.0);
	c2 = new Circle(p3, 26.0);
};

sketchpad.update = function() {
	p1.x += 1.0;
	p1.y += 0.5;

	p2.x += -0.1;
	p2.y += -0.3;
};

