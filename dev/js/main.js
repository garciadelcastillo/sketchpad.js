// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');

// var a = pad.value(10);

// var p = pad.point(150, 100);

// var b = pad.value(150), 
// 	c = pad.value(150),
// 	d = pad.value(150),
// 	e = pad.value(50);

// var pp = pad.point(b, c),
// 	ppp = pad.point(d, e);

// var ll = pad.value.distance(p, pp);

// var line1 = pad.line(p, pp),
// 	line2 = pad.line(pp, ppp);

// var pline2 = pad.point.along(line2, 0.5);

// console.log(
// 	pad
// 	.are
// 	.objects([a, 2, [0, 1], 'foobar', function () { return true; }])
// 	.ofTypes('value', 'number', 'array', 'string', 'function')
// );

var a = pad.value(150); 
	b = pad.value(200);

var p = pad.point(150, 100),
	pp = pad.point(a, b);	

var line1 = pad.line(p, pp);
var ab2 = pad.point.along(line1, 0.5);


var c = pad.value(100);

var p2 = pad.point(c, 300);


var A = pad.point(400, 100),
	B = pad.point(400, 200);
var AB = pad.line(A, B);
var C = pad.point.along(AB, 0.5);




var rot1 = 0,
	rot2 = 0;
pad.update = function() {
	rot1 += 0.01;
	rot2 += 0.02;
	a.add(Math.cos(rot1));
	ab2.properties.parameter.set(pad.utils.map(Math.cos(rot2), -1, 1, 0, 1));
};