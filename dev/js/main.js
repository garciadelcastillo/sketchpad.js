// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');

var A = pad.node(100, 100),
	B = pad.node(125, 100);

// var AB = pad.vector.twoPoints(A, B).normalize(); 
// var plane = pad.plane(A, AB);

var plane = pad.plane(A, pad.vector.twoPoints(A, B).normalize());

pad.autoNames();
