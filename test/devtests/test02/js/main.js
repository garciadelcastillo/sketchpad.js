// create a new instance of a Sketchpad object to draw in
var pad = new Sketchpad.Canvas('sketchpad');  


pad.setup = function() {
	p1 = new Point(pad, 200, 300);
	p2 = new Point(pad, 400, 500);
	p3 = new Point(pad, 500, 200);

	l1 = new Line(pad, p1, p2);
	l2 = new Line(pad, p2, p3);
	l3 = new Line(pad, p3, p1);

	pl1 = new PointAt(pad, l1, 0.25);
	c1 = new Circle(pad, pl1, 25);

	r1 = new Rectangle(pad, p1, -50, -25);
	pr = r1.pointAtCenter(pad);

	l4 = new Line(pad, pl1, pr);

	pl1.setVisible(false);
};

pad.update = function() {
	// p1.move(1, 0.5);
	// p2.move(-0.1, -0.33);
	pl1.setParameter( (pad.frameCount % 100) / 100 );
};






$(document).ready(function() {
  pad.setup();
  pad.loop();
});




