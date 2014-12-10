// init Sketchpad
var pad = new Sketchpad('sketchPadCanvas');

var halfWidth = pad.Measure.from(pad.width, function(parents) { 
	return parents[0].value / 2;
});

var halfHeight = pad.Measure.from(pad.height, function(parents) { 
	return parents[0].value / 2;
});

var center = pad.Point.fromMeasures(halfWidth, halfHeight);

var margin = 25;
var radius = pad.Measure.from(halfWidth, halfHeight, function(pp) {
	return Math.min(pp[0].value, pp[1].value) - margin;
})

var circle = pad.Circle.centerRadius(center, radius);


pad.update = function() {
	
};
