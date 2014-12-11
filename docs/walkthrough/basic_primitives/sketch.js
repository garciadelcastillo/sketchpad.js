// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');  

// Unconstrained Geometry
var point = new pad.Point(100, 100),          // Point(x, y)
    line = new pad.Line(100, 150, 300, 150),  // Line(x0, y0, x1, y1)
    circle = new pad.Circle(100, 200, 26);    // Circle(x, y, radius)

// Points are invisible by default
point.setVisible(true);