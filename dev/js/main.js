// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');

// STYLES
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



// INTERSECTIONS
var p0 = new pad.Point(100, 100),
	p1 = new pad.Point(400, 200),
	p2 = new pad.Point(100, 200),
	p3 = new pad.Point(400, 100);

var l01 = pad.Line.between(p0, p1),
	l23 = pad.Line.between(p2, p3);

var pint = pad.Point.intersection(l01, l23);

// parallel test
var p10 = new pad.Point(100, 300),
	p11 = new pad.Point(400, 300),
	p12 = new pad.Point(100, 400),
	p13 = new pad.Point(400, 400);
var lineA = pad.Line.between(p10, p11),
	lineB = pad.Line.between(p12, p13);
pint2 = pad.Point.intersection(lineA, lineB);


// line-circle
var p20 = new pad.Point(100, 500),
	p21 = new pad.Point(400, 500);
var line20 = pad.Line.between(p20, p21);
var pc = new pad.Point(250, 500),
	c = pad.Circle.centerRadius(pc, 26);
var pint3 = pad.Point.intersection(line20, c);

// circle-circle
var ppp0 = new pad.Point(250, 650),
	ppp1 = new pad.Point(250, 650),
	ppp2 = new pad.Point(250, 650);
var ccc0 = pad.Circle.centerRadius(ppp0, 25),
	ccc1 = pad.Circle.centerRadius(ppp1, 35),
	ccc2 = pad.Circle.centerRadius(ppp2, 45);
var pi0 = pad.Point.intersection(ccc0, ccc1),
	pi1 = pad.Point.intersection(ccc1, ccc2),
	pi2 = pad.Point.intersection(ccc2, ccc0);




pad.update = function() {
	// a1.move(-1, 1);
};
