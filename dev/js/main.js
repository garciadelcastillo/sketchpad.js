// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');

var a = pad.value(10);

var p = pad.point(150, 100);

var b = pad.value(150), 
	c = pad.value(150),
	d = pad.value(150),
	e = pad.value(50);

var pp = pad.point(b, c),
	ppp = pad.point(d, e);

var ll = pad.value.distance(p, pp);

var line1 = pad.line(p, pp),
	line2 = pad.line(pp, ppp);

// console.log(
// 	pad
// 	.are
// 	.objects([a, 2, [0, 1], 'foobar', function () { return true; }])
// 	.ofTypes('value', 'number', 'array', 'string', 'function')
// );

var ang1 = 0,
	ang2 = 0;
pad.update = function() {
	ang1 += 0.1;
	ang2 += 0.01;
	b.add(Math.cos(ang1));
	d.add(Math.cos(ang2));
};