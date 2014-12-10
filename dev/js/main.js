// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

// init Sketchpad
var pad = new Sketchpad('sketchPadCanvas');

// create a new style with text specifications
var heading = new pad.Style({
	stroke: 'black',
	fontFamily: 'Times New Roman',
	fontSize: '14pt',
	fontStyle: 'italic', 

	textVAlign: 'bottom',
	textHAlign: 'center',
	textOffsetX: 0,
	textOffsetY: 0
});

// create a Text tag and apply style
var title = new pad.Text('Dynamic text tags', 200, 50);
title.setStyle(heading);  // this won't affect the default global style


// draw some geometry
var A = new pad.Point(100, 100),
	B = new pad.Point(300, 100),
	C = new pad.Point(300, 400);

var AB = pad.Line.between(A, B),
	AC = pad.Line.between(A, C);

// assign default var names to all objects
pad.findElementNames();

// create tags for each object
pad.tagElementNames();


// create a new style with text specifications
var redText = new pad.Style({
	stroke: 'red',
	fontFamily: 'Times New Roman',
	fontSize: '8pt',
	fontStyle: 'normal', 

	textVAlign: 'middle',
	textHAlign: 'left',
	textOffsetX: 30,
	textOffsetY: 0
});

// create a circle over the line
var p = pad.Point.along(AC, 0.75);
p.setVisible(false);
var ACcircle = pad.Circle.centerRadius(p, 26);

// change name and create a styled Text tag 
ACcircle.name = '0.75*AC CIRCLE';
var circleTag = pad.Text.on(ACcircle);
circleTag.setStyle(redText);




pad.update = function() {
	
};
