// Create new instance of Sketchpad in target Canvas
var pad = new Sketchpad('sketchpadCanvas');  

// Create two unconstrained Nodes
var A = new pad.Node(160, 200),
	B = new pad.Node(480, 200);

// Now create a Line, passing the Nodes as arguments
var AB = pad.Line.between(A, B);

// Let's display some automatic tags on current sketch elements
pad.tagElementNames();