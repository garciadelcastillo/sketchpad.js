// ███████╗██╗  ██╗███████╗████████╗ ██████╗██╗  ██╗██████╗  █████╗ ██████╗ ██╗
// ██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝██║  ██║██╔══██╗██╔══██╗██╔══██╗██║
// ███████╗█████╔╝ █████╗     ██║   ██║     ███████║██████╔╝███████║██║  ██║██║
// ╚════██║██╔═██╗ ██╔══╝     ██║   ██║     ██╔══██║██╔═══╝ ██╔══██║██║  ██║╚═╝
// ███████║██║  ██╗███████╗   ██║   ╚██████╗██║  ██║██║     ██║  ██║██████╔╝██╗
// ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝

Sketchpad = function(canvasId) {

// Some internal constants
this.C = {

  BOOLEAN : 1,
  NUMBER  : 2,
  INTEGER : 3, 
  FLOAT   : 4,
  STRING  : 5,
  
  SET     : 11,
  MEASURE : 12, 
  
  POINT   : 21,
  LINE    : 22,
  CIRCLE  : 23,
  
  LENGTH  : 31,
  AREA    : 32,
  VOLUME  : 33,
  ANGLERAD: 34,
  ANGLEDEG: 35,
  
  PI      : Math.PI,
  TAU     : 2 * Math.PI,
  TODEGS  : 180 / Math.PI,
  TORADS  : Math.PI / 180
};


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

    // render sets: this should be a nested function of some sort (sets of sets?)
    if (self.elements[i].type == self.C.SET && self.elements[i].subtype != self.C.NUMBER) {
      // since elements were added to the parents list anyway, they are rendered
      // so no need to render them again
      // for (var j = 0; j < self.elements[i].length; j++) {
      //   self.elements[i].items[j].render(self.gr);
      // }
    }
    // or individual elements
    else {
  	  self.elements[i].render(self.gr);
    }
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

/**
 * Sets current drawing style
 * @param  {Style} style 
 * @return {Style} returns current pad style
 */
this.currentStyle = function(style) {
  this.style = style || new Style({});
  return this.style;
};

/**
 * Convert angle to radians
 * @param  {Number} angleInDegs
 * @return {Number}             
 */
this.toRadians = function(angleInDegs) {
  return angleInDegs * Math.PI / 180.0;
};




//  ██████╗ ███████╗ ██████╗  ██████╗ ██████╗ ███╗   ██╗███████╗████████╗
// ██╔════╝ ██╔════╝██╔═══██╗██╔════╝██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝
// ██║  ███╗█████╗  ██║   ██║██║     ██║   ██║██╔██╗ ██║███████╗   ██║   
// ██║   ██║██╔══╝  ██║   ██║██║     ██║   ██║██║╚██╗██║╚════██║   ██║   
// ╚██████╔╝███████╗╚██████╔╝╚██████╗╚██████╔╝██║ ╚████║███████║   ██║   
//  ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   

/**
 * A library to store all independent Geometry construction functions
 * @type {Object}
 */
this.G = {

  /**
   * Create a Set as a numeric range from limits and step count
   * @param  {Number} start
   * @param  {Number} end  
   * @param  {Number} steps
   * @return {Set}      
   */
  setRangeFromNumbers: function(start, end, steps) {
    var step = (end - start) / steps;
    var values = [];
    for (var i = start; i <= end; i+=step) {
      values.push(i);
    }
    var s = new self.Set(values);
    s.subtype = self.C.NUMBER;
    s.start = start;
    s.end = end;
    s.steps = steps;
    s.visible = false;  // temp workaround to avoid rendering numeric Sets
    return s;
  },

  /**
   * Create a Set as a numeric sequence from start, step size and number of items
   * @param {Number} start    
   * @param {Number} stepSize 
   * @param {Number} count    
   * @return {Set}
   */
  setSequenceFromNumbers: function(start, stepSize, count) {
    var values = [];
    for (var i = 0; i < count; i++) {
      values.push(start + i * stepSize);
    }
    var s = new self.Set(values);
    s.subtype = self.C.NUMBER;
    s.start = start;
    s.stepSize = stepSize;
    s.count = count;
    s.visible = false;  // temp workaround to avoid rendering numeric Sets
    return s;
  },

  setRandomSequenceFromNumbers: function(start, end, count) {
    var values = [],
        d = end - start;
    for (var i = 0; i < count; i++) {
      values.push(start + d * Math.random());
    }
    var s = new self.Set(values);
    s.subtype = self.C.NUMBER;
    s.start = start;
    s.end = end;
    s.count = count;
    s.visible = false;  // temp workaround to avoid rendering numeric Sets
    return s;
  },

  /**
   * Create a Point along a Line at the relative length 'parameter'
   * @param  {Line} line      
   * @param  {Number} parameter Relative length along the line
   * @return {Point}           
   */
  pointOnLine: function(line, parameter) {
    var p = new self.Point(0, 0);
    p.addParents(line, parameter);
    // line.addChild(p);
    // p.parameter = parameter;
    p.update = function() {
      this.x = this.parents[0].x0 + this.parents[1] * (this.parents[0].x1 - this.parents[0].x0);
      this.y = this.parents[0].y0 + this.parents[1] * (this.parents[0].y1 - this.parents[0].y0);
      this.updateChildren();
    };
    p.setParameter = self.G.setParameter;
    p.update();
    return p;
  },

  /**
   * Create a Point along a Line at the relative length 'parameter', 
   * defined by a Measure object
   * @param  {Line} line    
   * @param  {Measure} measure 
   * @return {Point}
   * @todo Find a way to merge this with G.PointOnLine, they are so similar...
   */
  pointOnLineFromMeasure: function(line, measure) {
    var p = new self.Point(0, 0);
    p.addParents(line, measure);
    // line.addChild(p);
    // measure.addChild(p);
    // p.parameter = measure;
    p.update = function() {
      this.x = this.parents[0].x0 + this.parents[1].value * (this.parents[0].x1 - this.parents[0].x0);
      this.y = this.parents[0].y0 + this.parents[1].value * (this.parents[0].y1 - this.parents[0].y0);
      this.updateChildren();
    };
    p.setParameter = self.G.setParameter;
    p.update();
    return p;
  },


  /**
   * Create a Set of Points along a Line at numeric 'parameters' defined by a 
   * number Set
   * @param  {Line} line
   * @param  {Set(Number)} parameterSet
   * @return {Set(Point)}
   */
  pointsOnLineFromNumberSet: function(line, parameterSet) {
    var items = [];
    for (var l = parameterSet.length, i = 0; i < l; i++) {
      items.push(new self.Point(0, 0));
    }
    var s = new self.Set(items);
    s.addParents(line, parameterSet);
    // line.addChild(s);
    // parameterSet.addChild(s);
    // s.parameter = parameterSet;
    s.update = function() {
      for (var i = 0; i < this.length; i++) {
        this.items[i].x = this.parents[0].x0 + this.parents[1].items[i] * (this.parents[0].x1 - this.parents[0].x0);
        this.items[i].y = this.parents[0].y0 + this.parents[1].items[i] * (this.parents[0].y1 - this.parents[0].y0);
        this.updateChildren(); 
      }
    };
    s.setParameter = self.G.setParameter;
    s.update();
    return s;
  },

  /**
   * A simple setter function to be attached to certain points
   * @param {Number} parameter
   */
  setParameter: function(parameter) {
    this.parents[1] = parameter;
    this.update();
  },

  /**
   * Create a Point along a Circle at the relative length 'parameter'
   * @param  {Circle} circle
   * @param  {Number} parameter
   * @return {Point}
   */
  pointOnCircle: function(circle, parameter) {
    var p = new self.Point(0, 0);
    p.addParents(circle);
    // circle.addChild(p);
    p.parameter = parameter;
    p.update = function() {
      var a = (this.parameter % 1) * self.C.TAU;
      this.x = this.parents[0].x + this.parents[0].r * Math.cos(a);
      this.y = this.parents[0].y + this.parents[0].r * Math.sin(a);
      this.updateChildren();
    };
    p.setParameter = self.G.setParameter;
    p.update();
    return p;
  },

  /**
   * Create a Point along a Circle at the relative length 'parameter'
   * defined by a Measure object
   * @param  {Circle} circle  
   * @param  {Measure} measure 
   * @return {Point}         
   */
  pointOnCircleFromMeasure: function(circle, measure) {
    var p = new self.Point(0, 0);
    p.addParents(circle, measure);
    // circle.addChild(p);
    // measure.addChild(p);
    // p.parameter = measure;
    p.update = function() {
      var a = (this.parents[1].value % 1) * self.C.TAU;
      this.x = this.parents[0].x + this.parents[0].r * Math.cos(a);
      this.y = this.parents[0].y + this.parents[0].r * Math.sin(a);
      this.updateChildren();
    };
    p.setParameter = self.G.setParameter;
    p.update();
    return p;
  },

  /**
   * Create a Set of Points along a Circle at relative lengths defined by
   * a numeric Set
   * @param  {Circle} circle       
   * @param  {Set(Number)} parameterSet 
   * @return {Set(Point)}              
   */
  pointsOnCircleFromNumberSet: function(circle, parameterSet) {
    var items = [];
    for (var l = parameterSet.length, i = 0; i < l; i++) {
      items.push(new self.Point(0, 0));
    }
    var s = new self.Set(items);
    s.addParents(circle, parameterSet);
    // circle.addChild(s);
    // parameterSet.addChild(s);
    s.update = function() {
      for (var i = 0; i < this.length; i++) {
        var a = (this.parents[1].items[i] % 1) * self.C.TAU;
        this.items[i].x = this.parents[0].x + this.parents[0].r * Math.cos(a);
        this.items[i].y = this.parents[0].y + this.parents[0].r * Math.sin(a);
        this.updateChildren(); 
      }
    };
    s.setParameter = self.G.setParameter;
    s.update();
    return s;
  },

  /**
   * Returns a Point projected on a Line
   * @param  {Point} sourcePoint 
   * @param  {Line} targetLine  
   * @return {Point}             
   * @TODO UPDATE FUNCTION SHOULD BE OPTIMIZED
   */
  pointProjectionOnLine: function(sourcePoint, targetLine) {
    var p = new self.Point(0, 0);
    p.addParents(sourcePoint, targetLine);
    // sourcePoint.addChild(p);
    // targetLine.addChild(p);
    p.update = function() {
      // 
      var dx = this.parents[1].x1 - this.parents[1].x0,
          dy = this.parents[1].y1 - this.parents[1].y0,
          dpx = this.parents[0].x - this.parents[1].x0,
          dpy = this.parents[0].y - this.parents[1].y0,
          l = self.U.lineLength(this.parents[1]),
          pl = (dx * dpx + dy * dpy) / l;
      this.x = this.parents[1].x0 + pl * dx / l;
      this.y = this.parents[1].y0 + pl * dy / l;
      this.updateChildren();
    };
    p.update();
    return p;
  },

  /**
   * Returns a Point projected on a Circle
   * @param  {Point} sourcePoint  
   * @param  {Circle} targetCircle 
   * @return {Point}              
   */
  pointProjectionOnCircle: function(sourcePoint, targetCircle) {
    var p = new self.Point(0, 0);
    p.addParents(sourcePoint, targetCircle);
    // sourcePoint.addChild(p);
    // targetCircle.addChild(p);
    p.update = function() {
      var a = self.U.angleBetweenCoordinates(this.parents[1].x, this.parents[1].y,
        this.parents[0].x, this.parents[0].y);
      this.x = this.parents[1].x + this.parents[1].r * Math.cos(a);
      this.y = this.parents[1].y + this.parents[1].r * Math.sin(a);
      this.updateChildren();
    };
    p.update();
    return p;
  },

  /**
   * Returns the intersection Point between two Lines
   * @param  {Line} line0 
   * @param  {Line} line1 
   * @return {Point}       
   * @ref http://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
   */
  pointIntersectionlLineLine: function(line0, line1) {
    var p = new self.Point(0, 0);
    p.addParents(line0, line1);
    // line0.addChild(p);
    // line1.addChild(p);
    p.update = function() {
      var dx0 = this.parents[0].x0 - this.parents[0].x1,
          dy0 = this.parents[0].y0 - this.parents[0].y1,
          dx1 = this.parents[1].x0 - this.parents[1].x1,
          dy1 = this.parents[1].y0 - this.parents[1].y1;
      var denom = dx0 * dy1 - dy0 * dx1;
      if (denom == 0) {
        console.log('Lines are parallel, no line-line intersection');
        this.x = 0;
        this.y = 0;
      } else {
        var c0 = this.parents[0].x0 * this.parents[0].y1 
          - this.parents[0].y0 * this.parents[0].x1;
        var c1 = this.parents[1].x0 * this.parents[1].y1 
          - this.parents[1].y0 * this.parents[1].x1;
        this.x = (c0 * dx1 - dx0 * c1) / denom;
        this.y = (c0 * dy1 - dy0 * c1) / denom;
      }
      this.updateChildren();
    }; 
    p.update();
    return p;
  },

  /**
   * Returns the intersection Points of a Line and a Circle
   * @param  {Line} line   
   * @param  {Circle} circle 
   * @return {Point}
   * @ref http://stackoverflow.com/a/1084899
   * @TODO UPDATE FUNCTION SHOULD BE OPTIMIZED
   * @TODO THIS SHOULD RETURN AN ARRAY OF POINTS, NOT JUST THE FIRST SOLUTION
   */
  pointIntersectionlLineCircle: function(line, circle) {
    var p = new self.Point(0, 0);
    p.addParents(line, circle);
    // line.addChild(p);
    // circle.addChild(p);
    p.update = function() {
      var dx = this.parents[0].x1 - this.parents[0].x0,
          dy = this.parents[0].y1 - this.parents[0].y0,
          dcx = this.parents[0].x0 - this.parents[1].x,
          dcy = this.parents[0].y0 - this.parents[1].y,
          r = this.parents[1].r,
          a = dx * dx + dy * dy,
          b = 2 * (dx * dcx + dy * dcy),
          c = (dcx * dcx + dcy * dcy) - r * r,
          disc = b * b - 4 * a * c;
      if (disc < 0) {
        console.log('No line-circle intersection');
        this.x = 0;
        this.y = 0;
      } else {
        var sq = Math.sqrt(disc),
            t0 = (-b - sq) / (2 * a),
            t1 = (-b + sq) / (2 * a);
        this.x = this.parents[0].x0 + t0 * dx;
        this.y = this.parents[0].y0 + t0 * dy;
        // an array of two points should be returned here...
      }
    };
    p.update();
    return p;
  },

  /**
   * Returns the intersection Points of two Circles
   * @param  {Circle} circle0 
   * @param  {Circle} circle1 
   * @return {Point}
   * @ref http://www.ambrsoft.com/TrigoCalc/Circles2/Circle2.htm
   */
  pointIntersectionlCircleCircle: function(circle0, circle1) {
    var p = new self.Point(0, 0);
    p.addParents(circle0, circle1);
    // circle0.addChild(p);
    // circle1.addChild(p);
    p.update = function() {
      var x0 = this.parents[0].x,
          y0 = this.parents[0].y,
          r0 = this.parents[0].r,
          x1 = this.parents[1].x,
          y1 = this.parents[1].y,
          r1 = this.parents[1].r;
      var D = self.U.distanceBetweenCoordinates(x0, y0, x1, y1);
      if (r0 + r1 < D || Math.abs(r0 - r1) > D) {
        console.log('No circle-circle intersection');
        this.x = 0;
        this.y = 0;
      } else {
        var delta = Math.sqrt( (D + r0 + r1) * (D + r0 - r1)
            * (D - r0 + r1) * (-D + r0 + r1) ) / 4;
        this.x = (x0 + x1) / 2 + (x1 - x0) * (r0 * r0 - r1 * r1) / (2 * D * D)
            + 2 * (y0 - y1) * delta / (D * D);
        this.y = (y0 + y1) / 2 + (y1 - y0) * (r0 * r0 - r1 * r1) / (2 * D * D)
            - 2 * (x0 - x1) * delta / (D * D);
        // the other solution comes from changing the plus/minus at the beginning of the carried lines
      }
    };
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
    var lin = new self.Line(0, 0, 0, 0);
    lin.addParents(startPoint, endPoint);
    // startPoint.addChild(lin);
    // endPoint.addChild(lin);
    lin.update = function() {
      this.x0 = this.parents[0].x;
      this.y0 = this.parents[0].y;
      this.x1 = this.parents[1].x;
      this.y1 = this.parents[1].y;
      this.updateChildren();
    };
    lin.update();
    return lin;
  },

  /**
   * Create a Line from starting Point and numeric length and angle
   * @param  {Point} startPoint 
   * @param  {Number} length     
   * @param  {Number} angle      
   * @return {Line}
   */
  lineFromPointLengthAngle: function(startPoint, length, angle) {
    var lin = new self.Line(0, 0, 0, 0);
    lin.addParents(startPoint);
    // startPoint.addChild(lin);
    lin.length = length;
    lin.angle = angle;
    lin.update = function() {
      this.x0 = this.parents[0].x;
      this.y0 = this.parents[0].y;
      this.x1 = this.x0 + this.length * Math.cos(this.angle);
      this.y1 = this.y0 + this.length * Math.sin(this.angle);
      this.updateChildren();
    };
    lin.update();
    return lin;
  },

  /**
   * Create a Line from starting Point, length Measure and numeric angle
   * @param  {Point} startPoint 
   * @param  {Measure} lengthM    
   * @param  {Number} angle      
   * @return {Line}
   */
  lineFromPointMeasureAngle: function(startPoint, lengthM, angle) {
    var lin = new self.Line(0, 0, 0, 0);
    lin.addParents(startPoint, lengthM);
    // startPoint.addChild(lin);
    // lengthM.addChild(lin);
    lin.angle = angle;
    lin.update = function() {
      this.x0 = this.parents[0].x;
      this.y0 = this.parents[0].y;
      this.x1 = this.x0 + this.parents[1].value * Math.cos(this.angle);
      this.y1 = this.y0 + this.parents[1].value * Math.sin(this.angle);
      this.updateChildren();
    };
    lin.update();
    return lin;
  },

  /**
   * Create a Line from starting Point, numeric length and Measure angle
   * @param  {Point} startPoint 
   * @param  {Number} length     
   * @param  {Measure} angleM     
   * @return {Line}            
   */
  lineFromPointLengthMeasure: function(startPoint, length, angleM) {
    var lin = new self.Line(0, 0, 0, 0);
    lin.addParents(startPoint, angleM);
    lin.length = length;
    lin.update = function() {
      var ang = this.parents[1].subtype == self.C.ANGLEDEG ?
          this.parents[1].value * self.C.TORADS :
          this.parents[1].value;
      this.x0 = this.parents[0].x;
      this.y0 = this.parents[0].y;
      this.x1 = this.x0 + this.length * Math.cos(ang);
      this.y1 = this.y0 + this.length * Math.sin(ang);
      this.updateChildren();
    };
    lin.update();
    return lin;
  },

  /**
   * Create a Line from a starting Point, Measure length and Measure angle
   * @param  {Point} startPoint 
   * @param  {Measure} length     
   * @param  {Measure} angleM     
   * @return {Line}     
   */
  lineFromPointMeasureMeasure: function(startPoint, lengthM, angleM) {
    var lin = new self.Line(0, 0, 0, 0);
    lin.addParents(startPoint, lengthM, angleM);
    lin.update = function() {
      var ang = this.parents[2].subtype == self.C.ANGLEDEG ?
          this.parents[2].value * self.C.TORADS :
          this.parents[2].value;
      this.x0 = this.parents[0].x;
      this.y0 = this.parents[0].y;
      this.x1 = this.x0 + this.parents[1].value * Math.cos(ang);
      this.y1 = this.y0 + this.parents[1].value * Math.sin(ang);
      this.updateChildren();
    };
    lin.update();
    return lin;
  },
    
  /**
   * Create a Circle from center point and radius
   * @param  {Point} centerPoint
   * @param  {Number} radius
   * @return {Circle}
   */
  circleFromPointAndRadius: function(centerPoint, radius) {
    var c = new self.Circle(0, 0, radius);
    c.addParents(centerPoint);
    // centerPoint.addChild(c);
    c.update = function() {
      this.x = this.parents[0].x;
      this.y = this.parents[0].y;
      this.updateChildren();
    };
    c.update();
    return c;
  }, 

  /**
   * Create a Circle from center point and measure
   * @param  {Point} centerPoint 
   * @param  {Measure} measure     
   * @return {Circle}             
   */
  circleFromPointAndMeasure: function(centerPoint, measure) {
    var c = new self.Circle(0, 0, 0);
    c.addParents(centerPoint, measure);
    // centerPoint.addChild(c);
    // measure.addChild(c);
    c.update = function() {
      this.x = this.parents[0].x;
      this.y = this.parents[0].y;
      this.r = this.parents[1].value;
      this.updateChildren();
    };
    c.update();
    return c;
  }

};




//  ██████╗ ███████╗ ██████╗  ██████╗ █████╗ ██╗      ██████╗
// ██╔════╝ ██╔════╝██╔═══██╗██╔════╝██╔══██╗██║     ██╔════╝
// ██║  ███╗█████╗  ██║   ██║██║     ███████║██║     ██║     
// ██║   ██║██╔══╝  ██║   ██║██║     ██╔══██║██║     ██║     
// ╚██████╔╝███████╗╚██████╔╝╚██████╗██║  ██║███████╗╚██████╗
//  ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝

/**
 * A library to store static utility functions
 * @type {Object}
 */
this.U = {                                                    

  /**
   * Returns the length of a Line object
   * @param  {Line} line 
   * @return {Number}
   */
  lineLength: function(line) {
    var dx = line.x1 - line.x0,
        dy = line.y1 - line.y0;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // /**
  //  * Returns the determinant of the 2x2 matrix formed by the start and 
  //  * end points of the line
  //  * @param  {Line} line
  //  * @return {Number}
  //  */
  // lineDeterminant: function(line) {
  //   return line.x0 * line.y1 - line.x1 * line.y0;
  // },

  /**
   * Returns the distance between two pairs of coordinates
   * @param  {Point} p0 
   * @param  {Point} p1 
   * @return {Number}    
   */
  distanceBetweenCoordinates: function(x0, y0, x1, y1) {
    return Math.sqrt((x1 - x0) * (x1 - x0)  + (y1 - y0) * (y1 - y0));
  },

  /**
   * Returns the distance between two points
   * @param  {Point} p0 
   * @param  {Point} p1 
   * @return {Number}    
   */
  distanceBetweenPoints: function(p0, p1) {
    var dx = p1.x - p0.x,
        dy = p1.y - p0.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Returns the angle in radians between two sets of coordinates
   * The result is inverted from regular cartesian coordinates (i.e. positive 
   *   angle is measured clockwise)
   * @param  {Number} x0 
   * @param  {Number} y0 
   * @param  {Number} x1 
   * @param  {Number} y1 
   * @return {Number}    
   */
  angleBetweenCoordinates: function(x0, y0, x1, y1) {
    return Math.atan2(y1 - y0, x1 - x0);
  },

  // /**
  //  * Returns the angle in radians between p0 and p1.
  //  * The result is inverted from regular cartesian coordinates (i.e. positive 
  //  *   angle is measured clockwise)
  //  * @param  {Point} p0
  //  * @param  {Point} p1
  //  * @return {Number}
  //  */
  // angleBetween2Points: function(p0, p1) {
  //   return Math.atan2(p1.y - p0.y, p1.x - p0.x);
  // },

  /**
   * Returns the angle in radians between p1 and p2, measured from p0.
   * The result is inverted from regular cartesian coordinates (i.e. positive 
   *   angle is measured clockwise)
   * @param  {Point} p0
   * @param  {Point} p1
   * @param  {Point} p2
   * @return {Number} 
   */
  angleBetween3Points: function(p0, p1, p2) {
    return (Math.atan2(p2.y - p0.y, p2.x - p0.x) 
      - Math.atan2(p1.y - p0.y, p1.x - p0.x));
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
  this.style = self.style;  // create a style from fallback defaults
};

/**
 * Pan's suggestion for name assignment
 * @todo  IMPLEMENT!
 */
this.Element.prototype.FindMe=function() {
  for(var a in window) {
    if ((window[a]==this)) {
      this.name=a;
      return;
    }
  }
};

/**
 * Appends any number of parent objects to this element, and appends this 
 * object to those parents as child
 * @param {Elements} parents Parent objects driving this element as args
 */
this.Element.prototype.addParents = function() {
  for (var l = arguments.length, i = 0; i < l; i++) {
    this.parents.push(arguments[i]);
    arguments[i].children.push(this);  // add this object as child to parent
  }
};

/**
 * Appends a child object to this element
 * @param {Element} child A child object dependant on this element
 * @deprecated Consider using Element.isChildOf instead
 */
this.Element.prototype.addChild = function(child) {
  console.warn('Element.addChild is deprecated, consider using Element.isChildOf instead');
	this.children.push(child);
};

/**
 * Appends this Element as child of the passed parents
 * @param {Elements} arguments Parent objects of this Element
 */
this.Element.prototype.isChildOf = function() {
  for (var l = arguments.length, i = 0; i < l; i++) {
    arguments[i].children.push(this);  // add this object as child to parent
  }
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

/**
 * Sets the current style of this object
 * @param {Style} style
 */
this.Element.prototype.setStyle = function(style) {
  this.style = style;
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
  this.type = self.C.POINT;
	this.x = xpos;
	this.y = ypos;
	this.r = 4;  // for representation when visible

  this.checkStates();
};
this.Point.prototype = Object.create(this.Element.prototype);
this.Point.prototype.constructor = this.Point;

/**
 * Render method
 */
this.Point.prototype.render = function() {
	self.gr.strokeStyle = this.style.stroke;
  self.gr.lineWidth = this.style.strokeWidth;
  self.gr.fillStyle = this.style.fill;
	self.gr.beginPath();
	self.gr.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
	self.gr.stroke();
  self.gr.fill();
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
  // number along line
  if (geom.type == self.C.LINE && typeof parameter === 'number') {
    return self.G.pointOnLine(geom, parameter);
  }
  // number along circle
  else if (geom.type == self.C.CIRCLE && typeof parameter === 'number') {
    return self.G.pointOnCircle(geom, parameter);
  }
  // measure along line
  else if (geom.type == self.C.LINE && parameter.type == self.C.MEASURE) {
    return self.G.pointOnLineFromMeasure(geom, parameter);
  }
  // measure along circle
  else if (geom.type == self.C.CIRCLE && parameter.type == self.C.MEASURE) {
    return self.G.pointOnCircleFromMeasure(geom, parameter);
  }
  // number set along line
  else if (geom.type == self.C.LINE && parameter.type == self.C.SET && parameter.subtype == self.C.NUMBER) {
    return self.G.pointsOnLineFromNumberSet(geom, parameter);    
  }
  // number set along circle
  else if (geom.type == self.C.CIRCLE && parameter.type == self.C.SET && parameter.subtype == self.C.NUMBER) {
    return self.G.pointsOnCircleFromNumberSet(geom, parameter);    
  }
  // not cool
  console.error('Sketchpad: invalid arguments for Point.along');
  return undefined;
};

/**
 * A constructor method to create a Point as the intersection of certain Geometry
 * @param  {Point} sourcePoint    
 * @param  {Geometry} targetGeometry 
 * @return {Point}
 */
this.Point.projection = function(sourcePoint, targetGeometry) {
  // point to line
  if (sourcePoint.type == self.C.POINT && targetGeometry.type == self.C.LINE) {
    return self.G.pointProjectionOnLine(sourcePoint, targetGeometry);  
  }
  // point to circle
  else if (sourcePoint.type == self.C.POINT && targetGeometry.type == self.C.CIRCLE) {
    return self.G.pointProjectionOnCircle(sourcePoint, targetGeometry); 
  }
  // not cool
  console.error('Sketchpad: invalid arguments for Point.projection');
  return undefined;
};

/**
 * A constructor method to create a Point as the intersection of certain Geometry
 * @param  {Geometry} geom0
 * @param  {Geometry} geom1
 * @return {Point}
 */
this.Point.intersection = function(geom0, geom1) {
  // line-line int
  if (geom0.type == self.C.LINE && geom1.type == self.C.LINE) {
    return self.G.pointIntersectionlLineLine(geom0, geom1);
  }
  // line-circle int
  else if (geom0.type == self.C.LINE && geom1.type == self.C.CIRCLE) {
    return self.G.pointIntersectionlLineCircle(geom0, geom1);
  } 
  else if (geom0.type == self.C.CIRCLE && geom1.type == self.C.LINE) {
    return self.G.pointIntersectionlLineCircle(geom1, geom0);
  }
  // circle-circle int
  else if (geom0.type == self.C.CIRCLE && geom1.type == self.C.CIRCLE) {
    return self.G.pointIntersectionlCircleCircle(geom0, geom1);
  }
  // not cool
  console.error('Sketchpad: invalid arguments for Point.intersection');
  return undefined;
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

  this.type = self.C.LINE;
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
  self.gr.strokeStyle = this.style.stroke;
  self.gr.lineWidth = this.style.strokeWidth;
  self.gr.beginPath();
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
  if (startPoint.type == self.C.POINT && endPoint.type == self.C.POINT) {
    return self.G.lineFromTwoPoints(startPoint, endPoint);
  }
  console.error('Sketchpad: invalid arguments for Line.between');
  return undefined;
};

this.Line.polar = function(startPoint, length, angle) {
  // point + number + number
  if (startPoint.type == self.C.POINT
    && typeof length === 'number'
    && typeof angle === 'number') {
    return self.G.lineFromPointLengthAngle(startPoint, length, angle);
  } 
  // point + measure + number
  else if (startPoint.type == self.C.POINT
    && length.type == self.C.MEASURE
    && typeof angle === 'number') {
    return self.G.lineFromPointMeasureAngle(startPoint, length, angle);
  }
  // point + number + measure
  else if (startPoint.type == self.C.POINT
    && typeof length === 'number'
    && angle.type == self.C.MEASURE) {
    return self.G.lineFromPointLengthMeasure(startPoint, length, angle);
  }
  // point + measure + measure
  else if (startPoint.type == self.C.POINT
    && angle.type == self.C.MEASURE
    && angle.type == self.C.MEASURE) {
    return self.G.lineFromPointMeasureMeasure(startPoint, length, angle);
  }
  console.error('Sketchpad: invalid arguments for Line.polar');
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

  this.type = self.C.CIRCLE;
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
  self.gr.strokeStyle = this.style.stroke;
  self.gr.lineWidth = this.style.strokeWidth;
  self.gr.fillStyle = this.style.fill;
  self.gr.beginPath();
  self.gr.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
  self.gr.fill();
  self.gr.stroke();
};

/**
 * Sets the position of the Point
 * @param {Number} xpos 
 * @param {Number} ypos 
 */   
this.Circle.prototype.setRadius = function(radius) {
  this.r = radius;
  this.updateChildren();
};

/**
 * A constructor method to create a Circle from a center point and radius
 * @param  {Point} centerPoint
 * @param  {Number || Measure} radius
 * @return {Circle}
 */
this.Circle.centerRadius = function(centerPoint, radius) {
  // center point + numeric radius
  if (centerPoint.type == self.C.POINT && typeof radius === 'number') {
    return self.G.circleFromPointAndRadius(centerPoint, radius);
  } 
  // center point + measure radius
  else if (centerPoint.type == self.C.POINT && radius.type == self.C.MEASURE) {
    return self.G.circleFromPointAndMeasure(centerPoint, radius);
  }
  // not cool
  console.error('Sketchpad: invalid arguments for Line.centerRadius');
  return undefined;
};



// ███╗   ███╗███████╗ █████╗ ███████╗██╗   ██╗ ██████╗ ██████╗ ███╗   ██╗███████╗████████╗
// ████╗ ████║██╔════╝██╔══██╗██╔════╝██║   ██║██╔════╝██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝
// ██╔████╔██║█████╗  ███████║███████╗██║   ██║██║     ██║   ██║██╔██╗ ██║███████╗   ██║   
// ██║╚██╔╝██║██╔══╝  ██╔══██║╚════██║██║   ██║██║     ██║   ██║██║╚██╗██║╚════██║   ██║   
// ██║ ╚═╝ ██║███████╗██║  ██║███████║╚██████╔╝╚██████╗╚██████╔╝██║ ╚████║███████║   ██║   
// ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   

/**
 * A library to store all independent Measure construction functions
 * @type {Object}
 */
this.M = {

  /**
   * Returns the Measure of linear distance between two points
   * @param  {Point} p0 
   * @param  {Point} p1 
   * @return {Measure}
   */
  distanceBetweenTwoPoints: function(p0, p1) {
    var m = new self.Measure(0);
    m.addParents(p0, p1);
    m.subtype = self.C.LENGTH;
    m.update = function() {
      var dx = this.parents[1].x - this.parents[0].x,
          dy = this.parents[1].y - this.parents[0].y;
      this.value = Math.sqrt(dx * dx + dy * dy);
      this.updateChildren();
    };
    m.update();
    return m;
  },

  /**
   * Returns the angle Measure between p1 and p2 measured from p0
   * Notice the result is positive in clockwise direction
   * @param  {Point} p0 
   * @param  {Point} p1 
   * @param  {Point} p2 
   * @return {Measure}    
   */
  angleBetweenThreePoints: function(p0, p1, p2) {
    var m = new self.Measure(0);
    m.addParents(p0, p1, p2);
    m.subtype = self.C.ANGLERAD;
    m.update = function() {
      this.value = self.U.angleBetween3Points(this.parents[0], this.parents[1], this.parents[2]);
      this.updateChildren();
    };
    m.update();
    return m;
  }

};




// ███╗   ███╗███████╗ █████╗ ███████╗██╗   ██╗██████╗ ███████╗
// ████╗ ████║██╔════╝██╔══██╗██╔════╝██║   ██║██╔══██╗██╔════╝
// ██╔████╔██║█████╗  ███████║███████╗██║   ██║██████╔╝█████╗  
// ██║╚██╔╝██║██╔══╝  ██╔══██║╚════██║██║   ██║██╔══██╗██╔══╝  
// ██║ ╚═╝ ██║███████╗██║  ██║███████║╚██████╔╝██║  ██║███████╗
// ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝

/**
 * Base Measure class representing a numeric relation between objects
 * @param {Number} value
 */
this.Measure = function(value) {
  self.Element.call(this);
  self.addElement(this);

  this.type = self.C.MEASURE;
  this.value = value;
  this.visible = false;  // temp workaround to avoid rendering Measure objects
};
this.Measure.prototype = Object.create(this.Element.prototype);
this.Measure.prototype.constructor = this.Measure;

/**
 * A constructor method to measure the distance between two objects
 * @param  {Geometry} element0
 * @param  {Geometry} element1
 * @return {Measure}
 */
this.Measure.distance = function(element0, element1) {
  if (element0.type == self.C.POINT && element1.type == self.C.POINT) {
    return self.M.distanceBetweenTwoPoints(element0, element1);
  }
  console.error('Sketchpad: invalid arguments for Measure.distance');
  return undefined; 
};

this.Measure.angle = function(elements) {
  var a = arguments,
      len = a.length;
  if (len == 3) {
    // angle between 3 points
    if (a[0].type == self.C.POINT
      && a[1].type == self.C.POINT
      && a[2].type == self.C.POINT) {
      return self.M.angleBetweenThreePoints(a[0], a[1], a[2]);
    }
  }
  // not cool
  console.error('Sketchpad: invalid arguments for Measure.angle');
  return undefined; 
}

/*
More candidates:
  . Measure.length
  . Measure.perimeter
  . Measure.area
  . Measure.angle
  . Measure.add(meas0, meas1, meas2...)  // adds several measures linearly
  . Measure.min(measure, measure)
  . Measure.max(measure, measure)  
  . Measure.custom(parent0, parent1, ..., fn)  // The user passes a function with several parents, and a function to compute the result
*/




// ███████╗███████╗████████╗
// ██╔════╝██╔════╝╚══██╔══╝
// ███████╗█████╗     ██║   
// ╚════██║██╔══╝     ██║   
// ███████║███████╗   ██║   
// ╚══════╝╚══════╝   ╚═╝   
/**
 * Base Set class representing a group of objects of some kind
 * @param {Array} items
 */
this.Set = function(items) {
  self.Element.call(this);
  self.addElement(this);

  this.type = self.C.SET;
  this.setItems(items, undefined);
};
this.Set.prototype = Object.create(this.Element.prototype);
this.Set.prototype.constructor = this.Set;

/**
 * Sets an array of objects to be the items in the Set. Must be passed a subtype
 * @param {Array} items   
 * @param {Number} subtype
 * @todo  Incorporate automatic detection of item subtype and consistency?
 */
this.Set.prototype.setItems = function(items, subtype) {
  this.items = items;
  this.length = items.length;
  this.subtype = subtype;
};

/**
 * A constructor to create a numeric range from limits and step count
 * @param  {Number/Measure} start 
 * @param  {Number/Measure} end   
 * @param  {Number/Measure} steps 
 * @return {Set}       
 */
this.Set.range = function(start, end, steps) {
  if (typeof start === 'number'
      && typeof end === 'number'
      && typeof steps === 'number') {
    return self.G.setRangeFromNumbers(start, end, steps);
  }
  console.error('Sketchpad: invalid arguments for Set.sequence');
  return undefined; 
};

/**
 * A constructor to create a numeric sequence from start, step size and count
 * @param  {Number/Measure} start    
 * @param  {Number/Measure} stepSize 
 * @param  {Number/Measure} count    
 * @return {Set}
 */
this.Set.sequence = function(start, stepSize, count) {
  if (typeof start === 'number'
      && typeof stepSize === 'number'
      && typeof count === 'number') {
    return self.G.setSequenceFromNumbers(start, stepSize, count);
  }
  console.error('Sketchpad: invalid arguments for Set.sequence');
  return undefined; 
};

/**
 * A constructor to create a numeric sequence of 'count' random elements between
 * 'start' and 'end'
 * @param  {Number/Measure} start
 * @param  {Number/Measure} end
 * @param  {Number/Measure} count
 * @return {Set}
 */
this.Set.random = function(start, end, count) {
  // numer + number + number
  if (typeof start === 'number'
      && typeof end === 'number'
      && typeof count === 'number') {
    return self.G.setRandomSequenceFromNumbers(start, end, count);
  }
  // not cool
  console.error('Sketchpad: invalid arguments for Set.random');
  return undefined; 
}




// ███████╗████████╗██╗   ██╗██╗     ███████╗
// ██╔════╝╚══██╔══╝╚██╗ ██╔╝██║     ██╔════╝
// ███████╗   ██║    ╚████╔╝ ██║     █████╗  
// ╚════██║   ██║     ╚██╔╝  ██║     ██╔══╝  
// ███████║   ██║      ██║   ███████╗███████╗
// ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝

/**
 * A basic Style class representing a drawing style
 * @param {object} styleObj An object literal with processing-style properties defining style
 */
this.Style = function(styleObj) {
  this.stroke = styleObj.stroke || '#000000';                  // default is black
  this.strokeWidth = styleObj.strokeWidth || 1.0;
  this.fill = styleObj.fill                                    // transparent by default
    ? (styleObj.fill == 'none' ? 'rgba(0, 0, 0, 0)' : styleObj.fill) 
    : 'rgba(0, 0, 0, 0)' ;
};

/**
 * Class method to apply this Style to a set of Elements
 * @param  {Element} objs Element object, accepts multiple arguments 
 */
this.Style.prototype.applyTo = function(objs) {
  for (var l = arguments.length, i = 0; i < l; i++) {
    arguments[i].setStyle(this);
  }
};






// ██╗███╗   ██╗██╗████████╗
// ██║████╗  ██║██║╚══██╔══╝
// ██║██╔██╗ ██║██║   ██║   
// ██║██║╚██╗██║██║   ██║   
// ██║██║ ╚████║██║   ██║   
// ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   

// Initialize canvas object
this.canvasId = canvasId;
this.canvas = document.getElementById(canvasId);
if (this.canvas) {
  this.style = new this.Style({});
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

