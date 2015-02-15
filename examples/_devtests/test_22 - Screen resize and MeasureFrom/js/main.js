// init Sketchpad
var pad = new Sketchpad('sketchPadCanvas');

// set halfWidth & halfHeight as dependants of pad.width & pad.height, which are predefined Measure objects in the pad
var halfWidth = pad.Measure.from(pad.width, function(parents) { 
	return parents[0].value / 2;
});
var halfHeight = pad.Measure.from(pad.height, function(parents) { 
	return parents[0].value / 2;
});

// anchor a point with these measures
var center = pad.Point.fromMeasures(halfWidth, halfHeight);

// set radius as dependant of two measures and an external visible variable
var margin = 25;
var radius = pad.Measure.from(halfWidth, halfHeight, function(pp) {
	return Math.min(pp[0].value, pp[1].value) - margin;
})

// the circle is now centered and fits the pad to a certain margin
var circle = pad.Circle.centerRadius(center, radius);


pad.update = function() {
	
};
