// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');

var a = pad.number(100),
	a2 = a.half();

var P = pad.point(100, 100);

var X = pad.number(200),
	Y = pad.number(250);

var PP = pad.point(X, 200);



// pad.update = function () {
// 	X.add(0.1);
// }