// ██████╗ ███████╗██╗   ██╗
// ██╔══██╗██╔════╝██║   ██║
// ██║  ██║█████╗  ██║   ██║
// ██║  ██║██╔══╝  ╚██╗ ██╔╝
// ██████╔╝███████╗ ╚████╔╝ 
// ╚═════╝ ╚══════╝  ╚═══╝  

var pad = new Sketchpad('sketchPadCanvas');

// var a = pad.var(100),
//     b = a.half(),
//     c = a.half(),
//     d = pad.var(c);

// var p1 = pad.point(100, 100);
// var p2 = pad.point(a, 200);
// var p3 = pad.point(a, b);


// var x0 = pad.var(100),
//     y0 = pad.var(100),
//     x1 = x0.double(),
//     y1 = y0.double();

// var start = pad.point(x0, y0),
//     end = pad.point(x1, y1);

// start.setVisible(false);
// end.setVisible(false);

// // var lineCoords = pad.line(x0, y0, x1, y1);
// var line = pad.line(start, end);

// var center = line.center();
// // var center2 = line.center();

// var end1 = line.end();
// // var end2 = line.end();

// var start1 = line.start();

// var node1 = pad.node(100, 200);




// var a = pad.var(100);

// var A = pad.node(100, 100),
//     B = pad.node(200, 100);

// var AB = pad.line(A, B);

// var C = AB.center();


// var X = pad.var(20), 
//     Y = pad.var(5);

// var vec = pad.vector(X, Y);
// vec.setRenderPosition(125, 125);

// var Ax = A.x(),
//     By = B.y();
// var vec2 = pad.vector(Ax, By);
// vec.setRenderPosition(125, 225);



// var A = pad.node(100, 100),
//     B = pad.node(200, 100);

// var AB = pad.line(A, B);

// var vector = pad.vector(AB.x1(), AB.y1());




var x = pad.var(50),
    y = pad.var(25);

var A = pad.node(100, 100),
    X = pad.vector(x, y);

X.setVisible(false);

var plane = pad.plane(A, X);




pad.autoNames();
