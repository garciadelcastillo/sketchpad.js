
// init Sketchpad
var pad = new Sketchpad('sketchPadCanvas');

// Create LINK LENGTH sliders
var L1 = Slider(pad, 25, 25, 150, 0, 300, 150, { }),
	L2 = Slider(pad, 200, 25, 150, 0, 300, 100, { }),
	L3 = Slider(pad, 375, 25, 150, 0, 300, 25, { });

// Create JOINT ANGLE knobs
var TAU = 2 * Math.PI;
var R1 = Knob(pad, 100, 60, 21, 0, TAU, 3 * TAU / 4, { }),
	R2 = Knob(pad, 275, 60, 21, 0, TAU, TAU / 4, { }),
	R3 = Knob(pad, 450, 60, 21, 0, TAU, TAU / 4, { });

// Concatenate rotations
var r1 = R1,
	r2 = pad.Measure.compose(R1, R2, function() { return R1.value + R2.value }),
	r3 = pad.Measure.compose(r2, R3, function() { return r2.value + R3.value });

// Anchor base joint on screen center
var J1X = pad.Measure.compose(pad.width, function() { return pad.width.value / 2; }),
	J1Y = pad.Measure.compose(pad.height, function() { return pad.height.value / 2; }),
	J1 = pad.Point.fromMeasures(J1X, J1Y);

// Concatenate other joints and links
var J2 = pad.Point.offsetPolar(J1, L1, r1),
	link1 = pad.Line.between(J1, J2);

var J3 = pad.Point.offsetPolar(J2, L2, r2),
	link2 = pad.Line.between(J2, J3);

var J4 = pad.Point.offsetPolar(J3, L3, r3),
	link3 = pad.Line.between(J3, J4);

// Some visual flavor
var j1c = pad.Circle.centerRadius(J1, 5),
	j2c = pad.Circle.centerRadius(J2, 5),
	j3c = pad.Circle.centerRadius(J3, 5);

var linkStyle = new pad.Style({
	stroke: '#ED5C13',
	strokeWidth: '3'
});
linkStyle.applyTo(link1, link2, link3);

var jointStyle = new pad.Style({
	stroke: '#000000',
	fill: '#ED5C13'
});
jointStyle.applyTo(j1c, j2c, j3c);








/**
 * Quick test to create a Slider object out of Sketchpad's built in stuff
 */
function Slider(pad, x, y, width, minValue, maxValue, startValue, options) {
	var axis = new pad.Line(x, y, x + width, y);
	var t = (startValue - minValue) / (maxValue - minValue);
	var handle = pad.Node.along(axis, t, {clamp: true});
	var measure = pad.Measure.compose(handle, function() {
		return minValue + (maxValue - minValue) * (handle.x - x) / width;  // handle gets scoped! serendipity!
	});
	var label = pad.Label.from(measure, {round: true}),
		tag = new pad.Tag.on(handle, label);
	return measure;
};

/**
 * Quick prototype test for a Knob class
 */
function Knob(pad, x, y, radius, minValue, maxValue, startValue, options) {
	var TAU = 2 * Math.PI,
		TO_DEG = 360 / TAU;

	var center = new pad.Point(x, y),
		base = pad.Point.offset(center, radius, 0),
		marker = pad.Line.between(center, base),		
		circle = pad.Circle.centerRadius(center, radius);

	var t = (startValue - minValue) / (maxValue - minValue),
		handle = pad.Node.along(circle, t);

	var measure = pad.Measure.compose(center, handle, function() {
		var tangle = pad.U.angleBetween2Points(handle, center) / TAU + 0.5;
		return minValue + tangle * (maxValue - minValue);
	});

	var measureDeg = pad.Measure.compose(measure, function() { return measure.value * TO_DEG; });
	var label = pad.Label.from(measureDeg, {round: true}),
		tagAnchor = pad.Point.offset(center, 0, 2.5 * radius),
		tag = pad.Tag.on(tagAnchor, label);

	return measure;
};