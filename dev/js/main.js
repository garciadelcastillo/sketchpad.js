// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');

// var value1 = pad.var(10);

// var A = pad.node(100, 100),
// 	B = pad.node(125, 100);

// var AB = pad.vector.twoPoints(A, B).normalize(); 
// var plane = pad.plane(A, AB);
// // var plane = pad.plane(A, pad.vector.twoPoints(A, B).normalize());

// var transT = pad.transform.translation(A);
// var rotT = pad.transform.rotation(Math.PI/4);
// var scaleT = pad.transform.scaling(13, value1);

// console.log(transT.str());
// console.log(rotT.str());
// console.log(scaleT.str());


var p0 = pad.point(100, 100),
	node0 = pad.node(0, 0),
	node1 = pad.node(1, 1);

var transT = pad.transform.translation(node0),
	rotT = pad.transform.rotation(node1.x().toRadians()),
	scaleT = pad.transform.scaling(node1.y().multiply(0.01));

// var p1 = p0.applyTransform(scaleT)
// 			.applyTransform(rotT)
// 			.applyTransform(transT);

var T = pad.transform(transT, rotT, scaleT);
var p1 = p0.applyTransform(T);

p1.setVisible(true);

pad.autoNames();



