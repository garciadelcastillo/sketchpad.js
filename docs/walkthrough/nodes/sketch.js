// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');  

// A free unconstrained Node, created with constructor
var node = new pad.Node(160, 200);  

// A Node with constrained Y movement
var nodeX = pad.Node.horizontal(320, 200);  

// A Node with constrained X movement
var nodeY = pad.Node.vertical(480, 200);  