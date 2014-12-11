// init Sketchpad
var pad = new Sketchpad('sketchPadCanvas');

// Create some geometry
var A = new pad.Node(100, 100),
	B = new pad.Node(300, 100),
	AB = pad.Line.between(A, B);
	D = pad.Measure.distance(A, B);

// Create Labels with associative text, and render them through a Tag
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
