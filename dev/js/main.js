// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

// init Sketchpad
var pad = new Sketchpad('sketchPadCanvas');

var boxWidth = Slider(pad, 25, 25, 150, 0, 300, 150, { }),
	boxHeight = Slider(pad, 25, 50, 150, 0, 300, 150, { });

// var halfWidth = pad.Measure.from(pad.width, function() { return pad.width.value / 2; });
// var halfHeight = pad.Measure.from(pad.height, function() { return pad.height.value / 2; });

var topleft = new pad.Point(200, 200),
	topright = pad.Point.offset(topleft, boxWidth, 0),
	bottomLeft = pad.Point.offset(topleft, 0, boxHeight),
	bottomRight = pad.Point.offset(topleft, boxWidth, boxHeight);

var top = pad.Line.between(topleft, topright),
	bottom = pad.Line.between(bottomLeft, bottomRight),
	left = pad.Line.between(topleft, bottomLeft),
	right = pad.Line.between(topright, bottomRight);

	

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
		return minValue +  (maxValue - minValue) * (handle.x - x) / width;  // handle gets scoped! serendipity!
	});
	return measure;
};