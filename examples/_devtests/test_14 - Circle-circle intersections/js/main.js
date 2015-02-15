var pad = new Sketchpad('sketchPadCanvas');

// circle-circle
var ppp0 = new pad.Point(200, 150),
	ppp1 = new pad.Point(300, 150),
	ppp2 = new pad.Point(225, 250);
var ccc0 = pad.Circle.centerRadius(ppp0, 50),
	ccc1 = pad.Circle.centerRadius(ppp1, 75),
	ccc2 = pad.Circle.centerRadius(ppp2, 100);
var pi0 = pad.Point.intersection(ccc0, ccc1),
	pi1 = pad.Point.intersection(ccc1, ccc2),
	pi2 = pad.Point.intersection(ccc2, ccc0);

pad.update = function() {

};