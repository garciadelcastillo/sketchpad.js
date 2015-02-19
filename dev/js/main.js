// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');

var R = slider(pad, 10, 20, 100, 0, 50, 26);

var circleStatic = pad.circle(100, 100, 26), 
	circleParametric = pad.circle(100, 200, R);

var A = new pad.Node(100, 300),
    circleA = pad.circle(A, 26);

var B = new pad.Node(100, 400),
    circleB = pad.circle(B, R);

var a = circleA.pointAt(0),
	b = circleB.pointAt(0.5),
	ab = pad.line(a, b),
	ab2 = ab.pointAt(0.5);
	line2 = pad.line(ab2, circleStatic.center());

pad.tagElementNames();


/**
 * Slider constructor with reworked line api
 */
function slider(pad, x, y, width, minValue, maxValue, startValue) {
	var axis = pad.line(x, y, x + width, y),
		t = (startValue - minValue) / (maxValue - minValue),
		handle = pad.Node.along(axis, t, {clamp: true});
	var measure = pad.Measure.compose(handle, function() {
		return minValue + (maxValue - minValue) * (handle.x - x) / width;
	});
	var label = pad.Label.from(measure, {round: true}),
		tag = new pad.Tag.on(handle, label);
	return measure;
};