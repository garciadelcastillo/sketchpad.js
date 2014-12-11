// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

// init Sketchpad
var pad = new Sketchpad('sketchPadCanvas');

var A = new pad.Node(100, 100),
	B = new pad.Node(300, 100),
	AB = pad.Line.between(A, B);
	D = pad.Measure.distance(A, B);


var labelA = pad.Label.compose(A, function() {
		return '[' + Math.round(A.x) + ',' + Math.round(A.y) + ']';
	}),
	tagA = pad.Tag.on(A, labelA);

var labelB = pad.Label.compose(B, function() {
		return '[' + Math.round(B.x) + ',' + Math.round(B.y) + ']';
	}),
	tagB = pad.Tag.on(B, labelB);

var labelAB = pad.Label.compose(D, function() {
		return "L = " + Math.round(D.value) + " px";
	}),
	tagAB = pad.Tag.on(AB, labelAB);



// pad.tagElementNames();

pad.update = function() {
	
};




/**
 * Quick test to create a Slider object out of Sketchpad's built in stuff
 */
function Slider(pad, x, y, width, minValue, maxValue, startValue, options) {
	var axis = new pad.Line(x, y, x + width, y);
	var t = (startValue - minValue) / (maxValue - minValue);
	var handle = pad.Node.along(axis, t, {clamp: true});
	var measure = pad.Measure.from(handle, function() {
		return minValue + (maxValue - minValue) * (handle.x - x) / width;  // handle gets scoped! serendipity!
	});
	return measure;
};