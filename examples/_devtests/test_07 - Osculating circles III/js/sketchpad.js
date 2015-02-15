// ███████╗██╗  ██╗███████╗████████╗ ██████╗██╗  ██╗██████╗  █████╗ ██████╗ ██╗
// ██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝██║  ██║██╔══██╗██╔══██╗██╔══██╗██║
// ███████╗█████╔╝ █████╗     ██║   ██║     ███████║██████╔╝███████║██║  ██║██║
// ╚════██║██╔═██╗ ██╔══╝     ██║   ██║     ██╔══██║██╔═══╝ ██╔══██║██║  ██║╚═╝
// ███████║██║  ██╗███████╗   ██║   ╚██████╗██║  ██║██║     ██║  ██║██████╔╝██╗
// ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝

Sketchpad = function(canvasId) {

// Some internal constants
this.POINT = 1;
this.LINE = 2;
this.CIRCLE = 3;


// ██████╗  █████╗ ███████╗███████╗
// ██╔══██╗██╔══██╗██╔════╝██╔════╝
// ██████╔╝███████║███████╗█████╗  
// ██╔══██╗██╔══██║╚════██║██╔══╝  
// ██████╔╝██║  ██║███████║███████╗
// ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
	
// Private properties
var self = this;  // store this context
this.elements = [];
this.init = false;
this.width;
this.height;
this.canvas;
this.canvasId
this.gr;
this.parentDiv;

// Public properties
this.frameCount = 0;

// State-based flags
/**
 * If false, new geometry will not be visible
 * @type {Boolean}
 */
this.drawVisible = true;

/**
 * An 'update' function with code to run on each sketchpad loop.
 * Will be executed AFTER the render fn.
 * This is mean to be overriden by the user:
 *   pad.update = function() {
 *     point.move(1, 0);  
 *   };
 */
this.update = function() { };

/**
 * The main render function for this Sketchpad
 */
this.render = function() {
	// clean the background
	self.gr.globalAlpha = 1.00;
	self.gr.fillStyle = "#ffffff";
	self.gr.fillRect(0, 0, self.width, self.height);

	// render each element
	for (var i = 0; i < self.elements.length; i++) {
	  if (!self.elements[i].visible) continue;
	  self.elements[i].render(self.gr);
	}
};

/**
 * Main internal auto loop function
 */
this.loop = function() {
	window.requestAnimFrame(self.loop);
	self.render();
	self.update();
	self.frameCount++;
};

/**
 * Adds an element to the list of linked objects
 * @param {Element} element 
 */
this.addElement = function(element) {
	self.elements.push(element);
};

/**
 * Turns on drawing visible geometry mode
 */
this.visible = function() {
  this.drawVisible = true;
};

/**
 * Turns off drawing visible geometry mode
 */
this.invisible = function() {
  this.drawVisible = false;
};

// Initialize canvas
this.canvasId = canvasId;
this.canvas = document.getElementById(canvasId);
if (this.canvas) {
	this.gr = this.canvas.getContext('2d');
	this.parentDiv = this.canvas.parentNode;
	this.width = $(this.parentDiv).innerWidth();
	this.height = $(this.parentDiv).innerHeight();
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.init = true;  // looping kicks in
	this.loop();
} else {
	console.error('Sketchpad: Must initialize Sketchpad with a valid id for a' + 
		' DOM canvas object, e.g. var pad = new Sketchpad("sketchPadCanvas")');
	return null;
}





//  ██████╗ ███████╗ ██████╗  ██████╗ ██████╗ ███╗   ██╗███████╗████████╗
// ██╔════╝ ██╔════╝██╔═══██╗██╔════╝██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝
// ██║  ███╗█████╗  ██║   ██║██║     ██║   ██║██╔██╗ ██║███████╗   ██║   
// ██║   ██║██╔══╝  ██║   ██║██║     ██║   ██║██║╚██╗██║╚════██║   ██║   
// ╚██████╔╝███████╗╚██████╔╝╚██████╗╚██████╔╝██║ ╚████║███████║   ██║   
//  ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   

/**
 * An library to store all independent Geometry construction functions
 * @type {Object}
 */
this.G = {

  setParameter: function(parameter) {
    this.parameter = parameter;
    this.update();
  },

  /**
   * Create a Point along a Line at the relative length 'parameter'
   * @param  {Line} line      
   * @param  {Number} parameter Relative length along the line
   * @return {Point}           
   */
  pointOnLine: function(line, parameter) {
    var p = new self.Point(0, 0);
    line.addChild(p);
    p.parentLine = line;
    p.parameter = parameter;
    p.update = function() {
      this.x = this.parentLine.x0 + this.parameter * (this.parentLine.x1 - this.parentLine.x0);
      this.y = this.parentLine.y0 + this.parameter * (this.parentLine.y1 - this.parentLine.y0);
      this.updateChildren();
    };
    p.setParameter = self.G.setParameter;
    p.update();
    return p;
  },

  /**
   * Create a Point along a Circle at the relative length 'parameter'
   * @param  {Circle} circle
   * @param  {Number} parameter
   * @return {Point}
   */
  pointOnCircle: function(circle, parameter) {
    var p = new self.Point(0, 0);
    circle.addChild(p);
    p.parentCircle = circle;
    p.parameter = parameter;
    p.update = function() {
      var a = (this.parameter % 1) * 180 / Math.PI;  // does this work for negative numbers?
      this.x = this.parentCircle.x + this.parentCircle.r * Math.cos(a);
      this.y = this.parentCircle.y + this.parentCircle.r * Math.sin(a);
      this.updateChildren();
    };
    p.setParameter = self.G.setParameter;
    p.update();
    return p;
  },

  /**
   * Create a Line from two Points
   * @param  {Point} startPoint 
   * @param  {Point} endPoint   
   * @return {Line}
   */
  lineFromTwoPoints: function(startPoint, endPoint) {
    var lin  = new self.Line(0, 0, 0, 0);
    startPoint.addChild(lin);
    endPoint.addChild(lin);
    lin.startPoint = startPoint;
    lin.endPoint = endPoint;
    lin.update = function() {
      this.x0 = this.startPoint.x;
      this.y0 = this.startPoint.y;
      this.x1 = this.endPoint.x;
      this.y1 = this.endPoint.y;
      this.updateChildren();
    };
    lin.update();
    return lin;
  },

  circleFromPointAndRadius: function(centerPoint, radius) {
    var c = new self.Circle(0, 0, radius);
    centerPoint.addChild(c);
    c.centerPoint = centerPoint;
    c.update = function() {
      this.x = this.centerPoint.x;
      this.y = this.centerPoint.y;
      this.updateChildren();
    };
    c.update();
    return c;
  }
};






// ███████╗██╗     ███████╗███╗   ███╗███████╗███╗   ██╗████████╗
// ██╔════╝██║     ██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝
// █████╗  ██║     █████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║   
// ██╔══╝  ██║     ██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   
// ███████╗███████╗███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   
// ╚══════╝╚══════╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝                                                         

/**
 * A base Element class from which any associative object inherits
 * @comment Should probably implement a middleware Geometry class to 
 * differentiate from Style or Measure elements
 */
this.Element = function() {
	this.parents = [];
	this.children = [];
	this.visible = true;
};

/**
 * Appends a child object to this element
 * @param {Element} child A child object dependant on this element
 */
this.Element.prototype.addChild = function(child) {
	this.children.push(child);
};

/**
 * Calls the update methods on each children
 * @return {[type]} [description]
 */
this.Element.prototype.updateChildren = function() {
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].update();
	}
};

/**
 * Sets the 'visible' property of an object
 * @param {Boolean} isVisible
 */
this.Element.prototype.setVisible = function(isVisible) {
	this.visible = isVisible;
};

/**
 * Checks pad state-based flags and sets properties accordingly
 * @return {[type]} [description]
 */
this.Element.prototype.checkStates = function() {
  this.visible = self.drawVisible;
};



// ██████╗  ██████╗ ██╗███╗   ██╗████████╗
// ██╔══██╗██╔═══██╗██║████╗  ██║╚══██╔══╝
// ██████╔╝██║   ██║██║██╔██╗ ██║   ██║   
// ██╔═══╝ ██║   ██║██║██║╚██╗██║   ██║   
// ██║     ╚██████╔╝██║██║ ╚████║   ██║   
// ╚═╝      ╚═════╝ ╚═╝╚═╝  ╚═══╝   ╚═╝   

/**
 * Base Point class, represents coordinates in 2D space
 * @param {Number} xpos 
 * @param {Number} ypos 
 */
this.Point = function(xpos, ypos) {
	self.Element.call(this);
  self.addElement(this);

	this.pad = self;
  this.type = self.POINT;
	this.x = xpos;
	this.y = ypos;
	this.r = 5;  // for representation when visible

  this.checkStates();
};
this.Point.prototype = Object.create(this.Element.prototype);
this.Point.prototype.constructor = this.Point;

/**
 * Render method
 */
this.Point.prototype.render = function() {
	self.gr.lineWidth = 1.0;
	self.gr.strokeStyle = "#000";
	self.gr.beginPath();
	self.gr.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
	self.gr.stroke();
};

/**
 * Sets the position of the Point
 * @param {Number} xpos 
 * @param {Number} ypos 
 */		
this.Point.prototype.setPosition = function(xpos, ypos) {
	this.x = xpos;
	this.y = ypos;
	this.updateChildren();
};

/**
 * Moves the Point a certain increment
 * @param  {Number} xinc
 * @param  {Number} yinc
 */
this.Point.prototype.move = function(xinc, yinc) {
	this.x += xinc;
	this.y += yinc;
	this.updateChildren();
};

/**
 * A constructor method to create a Point along certain Geometry
 * The method discriminates valid geometric/numeric inputs, and returns the possible
 * Point/s (if possible)
 * @param  {Geometry} geom
 * @param  {Number} parameter
 * @return {Point}
 */
this.Point.along = function(geom, parameter) {
  switch(geom.type) {
    case self.LINE:
      return self.G.pointOnLine(geom, parameter);
    case self.CIRCLE:
      return self.G.pointOnCircle(geom, parameter);
    default:
      console.error('Sketchpad: invalid arguments for Point.along');
      return undefined;
  };
};



// ██╗     ██╗███╗   ██╗███████╗
// ██║     ██║████╗  ██║██╔════╝
// ██║     ██║██╔██╗ ██║█████╗  
// ██║     ██║██║╚██╗██║██╔══╝  
// ███████╗██║██║ ╚████║███████╗
// ╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝                             

/**
 * Base primitive Line class, constructed from x y coordinates 
 * @param {Number} xpos0 
 * @param {Number} ypos0 
 * @param {Number} xpos1 
 * @param {Number} ypos1 
 */
this.Line = function(xpos0, ypos0, xpos1, ypos1) {
  self.Element.call(this);
  self.addElement(this);

  this.type = self.LINE;
  this.x0 = xpos0;
  this.y0 = ypos0;
  this.x1 = xpos1;
  this.y1 = ypos1;

  this.checkStates();
};
this.Line.prototype = Object.create(this.Element.prototype);
this.Line.prototype.constructor = this.Line;

/**
 * Render method
 */
this.Line.prototype.render = function() {
  self.gr.beginPath();
  self.gr.lineWidth = 1.0;
  self.gr.strokeStyle = "#000"; 
  self.gr.moveTo(this.x0, this.y0);
  self.gr.lineTo(this.x1, this.y1);
  self.gr.stroke();
};

/**
 * A constructor method to create a Line between two Geometry elements
 * @param  {Geometry} startPoint
 * @param  {Geometry} endPoint
 * @return {Line}
 */
this.Line.between = function(startPoint, endPoint) {
  if (startPoint.type == self.POINT && endPoint.type == self.POINT) {
    return self.G.lineFromTwoPoints(startPoint, endPoint);
  }
  console.error('Sketchpad: invalid arguments for Line.between');
  return undefined;
};



//  ██████╗██╗██████╗  ██████╗██╗     ███████╗
// ██╔════╝██║██╔══██╗██╔════╝██║     ██╔════╝
// ██║     ██║██████╔╝██║     ██║     █████╗  
// ██║     ██║██╔══██╗██║     ██║     ██╔══╝  
// ╚██████╗██║██║  ██║╚██████╗███████╗███████╗
//  ╚═════╝╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚══════╝

/**
 * Base primitive Circle method, created from x y coords and radius
 * @param {Number} xpos   
 * @param {Number} ypos   
 * @param {Number} radius 
 */
this.Circle = function(xpos, ypos, radius) {
  self.Element.call(this);
  self.addElement(this);

  this.type = self.CIRCLE;
  this.x = xpos;
  this.y = ypos;
  this.r = radius;

  this.checkStates();
};
this.Circle.prototype = Object.create(this.Element.prototype);
this.Circle.prototype.constructor = this.Circle;

/**
 * Render method
 */
this.Circle.prototype.render = function() {
  self.gr.lineWidth = 1.0;
  self.gr.strokeStyle = "#000"; 
  self.gr.beginPath();
  self.gr.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
  self.gr.stroke();
};

/**
 * A constructor method to create a Circle from a center point and radius
 * @param  {Point} centerPoint
 * @param  {Number} radius
 * @return {Circle}
 */
this.Circle.centerRadius = function(centerPoint, radius) {
  if (centerPoint.type == self.POINT && typeof radius === 'number') {
    return self.G.circleFromPointAndRadius(centerPoint, radius);
  }
  console.error('Sketchpad: invalid arguments for Line.centerRadius');
  return undefined;
};



// ██████╗ ███████╗ ██████╗████████╗ █████╗ ███╗   ██╗ ██████╗ ██╗     ███████╗
// ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗████╗  ██║██╔════╝ ██║     ██╔════╝
// ██████╔╝█████╗  ██║        ██║   ███████║██╔██╗ ██║██║  ███╗██║     █████╗  
// ██╔══██╗██╔══╝  ██║        ██║   ██╔══██║██║╚██╗██║██║   ██║██║     ██╔══╝  
// ██║  ██║███████╗╚██████╗   ██║   ██║  ██║██║ ╚████║╚██████╔╝███████╗███████╗
// ╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝

// TEMP OFF

// this.Rectangle = function(basePoint, width, height) {
// 	self.Element.call(this);
// 	self.addElement(this);

// 	basePoint.addChild(this);
// 	this.basePoint = basePoint;
// 	this.w = width;
// 	this.h = height;
// 	this.x0 = 0, this.y0 = 0;

// 	this.update();
// };
// this.Rectangle.prototype = Object.create(this.Element.prototype);
// this.Rectangle.prototype.constructor = this.Rectangle;

// this.Rectangle.prototype.render = function() {
// 	self.gr.lineWidth = 1.0;
// 	self.gr.strokeStyle = "#000"; 
// 	self.gr.beginPath();
// 	self.gr.rect(this.x0, this.y0, this.w, this.h);
// 	self.gr.stroke();
// };

// this.Rectangle.prototype.update = function() {
// 	this.x0 = this.basePoint.x;
// 	this.y0 = this.basePoint.y;
// 	this.updateChildren();
// };

















// ███╗   ███╗ ██████╗ ██╗   ██╗███████╗███████╗
// ████╗ ████║██╔═══██╗██║   ██║██╔════╝██╔════╝
// ██╔████╔██║██║   ██║██║   ██║███████╗█████╗  
// ██║╚██╔╝██║██║   ██║██║   ██║╚════██║██╔══╝  
// ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝███████║███████╗
// ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝

/**
 * A mouse object encapsulating state-based properties and mouse events
 * @type {Object}
 */
this.mouse = {
	x: 0,
	y: 0,
	down: false,
	downX: 0,
	downY: 0,
	dragObject: null,

	dist2ToPoint: function (x, y, point) {
		return (point.x - x) * (point.x - x) + (point.y - y) * (point.y - y);
	},

	searchPointToDrag: function (x, y) {
		for (var len = self.elements.length, i = 0; i < len; i++) {
			var elem = self.elements[i];
			if (elem.constructor != self.Point) continue;
			if (this.dist2ToPoint(x, y, elem) < 25) return elem;		// <--- SUPER DIRTY, NEEDS IMPROV
		}
		return null;
	},

	onMouseDown: function (e) {
		self.mouse.down = true;
		self.mouse.downX = self.mouse.x;
		self.mouse.downY = self.mouse.y;
		self.mouse.dragObject = self.mouse.searchPointToDrag(self.mouse.downX, self.mouse.downY);
	},

	onMouseMove: function (e) {
		var offset = $(self.canvas).offset();
		self.mouse.x = e.pageX - offset.left;
		self.mouse.y = e.pageY - offset.top;
		if (self.mouse.dragObject) {
			self.mouse.dragObject.x = self.mouse.x;
			self.mouse.dragObject.y = self.mouse.y;
			self.mouse.dragObject.updateChildren();
		}
	},

	onMouseUp: function (e) {
		self.mouse.down = false;
		self.mouse.dragObject = null;
	}
};

$(this.canvas).mousedown(this.mouse.onMouseDown);
$(this.canvas).mousemove(this.mouse.onMouseMove);
$(this.canvas).mouseup(this.mouse.onMouseUp);






};

