// create a new instance of a Sketchpad object to draw in
var pad = new Sketchpad.Canvas('sketchpad');  

pad.setup = function() {
	// Pan's meeting
	// pad.addPoint(100, 100, "p0");
	// pad.addPoint(0,0);

	// pad.addCircle(0.0, 0.0, 5.0);
	// pad.addCircle("p0", "p1");

	// pad.addCircle({x:0, y:0, r:5});

	// pad.addPoint(20,20,"p0");

 //    pad("p0").x=7;
 //    pad("p.*").y=5;

 //    pad("p0").x=pad("p1");


	p0 = new Point(pad, 100, 100);
	p1 = new Point(pad, 500, 500);
	p2 = new Point(pad, 500, 100);

	line01 = new Line(pad, p0, p1);
	line12 = new Line(pad, p1, p2);
	line20 = new Line(pad, p2, p0);

	p01 = new PointAt(pad, line01, 0.0);
	// p01.setVisible(false);
	lineParam = new Line(pad, p2, p01);

	p12 = new PointAt(pad, line12, 0.0);
	p12.setVisible(false);
	r12 = new Rectangle(pad, p12, 100, 25);
	
	rectCenter = r12.pointAtCenter(pad);
	rectCenter.setVisible(false);
	lineToRect0 = new Line(pad, p0, rectCenter);
	lineToRect1 = new Line(pad, p1, rectCenter);
	lineToRect2 = new Line(pad, p2, rectCenter);

	p20 = new PointAt(pad, line20, 0.0);
	p20.setVisible(false);
	c20 = new Circle(pad, p20, 20);
};

pad.update = function() {
	p01.setParameter( (pad.frameCount % 100) / 100 );
	p12.setParameter( (pad.frameCount % 200) / 200 );
	p20.setParameter( (pad.frameCount % 300) / 300 );
};






$(document).ready(function() {
  pad.setup();
  pad.loop();
});




