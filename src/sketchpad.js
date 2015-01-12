/*
  Copyright (c) 2014, Jose Luis Garcia del Castillo y Lopez
  http://garciadelcastillo.es
  All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
 */

// ███████╗██╗  ██╗███████╗████████╗ ██████╗██╗  ██╗██████╗  █████╗ ██████╗ ██╗
// ██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝██║  ██║██╔══██╗██╔══██╗██╔══██╗██║
// ███████╗█████╔╝ █████╗     ██║   ██║     ███████║██████╔╝███████║██║  ██║██║
// ╚════██║██╔═██╗ ██╔══╝     ██║   ██║     ██╔══██║██╔═══╝ ██╔══██║██║  ██║╚═╝
// ███████║██║  ██╗███████╗   ██║   ╚██████╗██║  ██║██║     ██║  ██║██████╔╝██╗
// ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝

Sketchpad = function(canvasId) {

this.version = "v0.0.3";
this.build = 1100;

// jQuery detection
if (!window.jQuery) {
  console.error('Sketchpad.js depends on jQuery. Please add it to current window context.');
  return undefined;
}

// Some internal constants
this.C = {

  BOOLEAN   : 1,
  NUMBER    : 2,
  INTEGER   : 3, 
  FLOAT     : 4,
  STRING    : 5,
  
  SET       : 11,
  MEASURE   : 12, 
  
  POINT     : 21,
  NODE      : 22,
  LINE      : 23,
  CIRCLE    : 24,
  
  LENGTH    : 31,
  AREA      : 32,
  VOLUME    : 33,
  ANGLE_RAD : 34,
  ANGLE_DEG : 35,
  
  STYLE     : 41, 
  LABEL     : 42,
  TAG       : 43,
  
  PI        : Math.PI,
  TAU       : 2 * Math.PI,
  TO_DEGS   : 180 / Math.PI,
  TO_RADS   : Math.PI / 180

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
this.initialized = false;
this.canvas;
this.canvasId
this.gr;
this.parentDiv;
this._canvasWidth;    // the numeric values
this._canvasHeight;

// Public Measure objects that update on resize!
this.width;
this.height;

// Public properties
this.frameCount = 0;

// State-based flags
/**
 * If false, new geometry will not be visible
 * @type {Boolean}
 */
this.drawVisible = true;


/**
 * Internal start block. Will be run once before first pad.loop() interation
 */
this.start = function() { };


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
 * Same as pad.update(), but is run before the pad.render function 
 */
this.preupdate = function() { };

/**
 * The main render function for this Sketchpad
 */
this.render = function() {
	// clean the background
	self.gr.globalAlpha = 1.00;
	self.gr.fillStyle = "#ffffff";
  self.gr.clearRect(0, 0, self._canvasWidth, self._canvasHeight);
  self.gr.fillRect(0, 0, self._canvasWidth, self._canvasHeight);
  
  // gross workaround to the 1px line aliasing problem: http://stackoverflow.com/a/3279863/1934487
  self.gr.translate(0.5, 0.5);

	// render each element
	for (var i = 0; i < self.elements.length; i++) {
	  if (!self.elements[i].visible) continue;

    // render sets: this should be a nested function of some sort (sets of sets?)
    if (self.elements[i].type == self.C.SET && self.elements[i].subtype != self.C.NUMBER) {
      // since elements were added to the parents list anyway, they are rendered
      // so no need to render them again (?)
      // for (var j = 0; j < self.elements[i].length; j++) {
      //   self.elements[i].items[j].render(self.gr);
      // }
    }

    // or individual elements
    else {
  	  self.elements[i].render(self.gr);
    }
	}

  // revert the translation
  self.gr.translate(-0.5, -0.5);  
};

/**
 * Main internal auto loop function
 */
this.loop = function() {
	window.requestAnimFrame(self.loop);
  self.preupdate();
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
 * @deprecated
 */
this.toRadians = function(angleInDegs) {
  console.warn('pad.toRadians is deprecated, consider using pad.C.TORAD instead');
  return angleInDegs * Math.PI / 180.0;
};

/**
 * Searches the window object for properties with the same name as this pad's 
 * elements, and assigns names correspondingly
 */
this.findElementNames = function() {
  this.elements.forEach(function(e) {
    if (!e.name) e.findName();
  })
};

/**
 * For all elements in this pad, generate a Tag with its name.
 * If no name property is available, try to fallback on the Element's window variable name. 
 */
this.tagElementNames = function() {
  this.elements.forEach(function(e) {
    if (!e.name) e.findName();      // if there was no previous name, try to fallback on window var name
    if (e.name) this.Tag.on(e, e.name);    // create a Text tag if some name was found
  }, this);  // pass current context as 'this' object inside forEach 
};

/**
 * For all Nodes in this pad, generate a Tag with its name.
 * If no name property is available, try to fallback on the Element's window variable name.
 */
this.tagNodes = function() {
  this.elements.forEach(function(e) {
    if (e.subtype != self.C.NODE) return;
    if (!e.name) e.findName();
    if (e.name) this.Tag.on(e, e.name);
  }, this);
};

this.tagPoints = function() {
  this.elements.forEach(function(e) {
    if (e.type != self.C.POINT && e.subtype != self.C.NODE) return;
    if (!e.name) e.findName();
    if (e.name) {
      this.Tag.on(e, e.name);
      e.setVisible(true);
    }
  }, this);
};

this.showPoints = function() {
  this.elements.forEach(function(e) {
    if (e.type == self.C.POINT) e.setVisible(true);
  });
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

  /**
   * Create a Set as a numeric sequence with count items of random value between start and end
   * @param {Number} start    
   * @param {Number} end 
   * @param {Number} count    
   * @return {Set}
   */
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
   * Create a Point from two Measure objects
   * @param {Measure} measureX
   * @param {Measure} measureY 
   * @return {Point} 
   */
  pointFromTwoMeasures: function(measureX, measureY) {
    var p = new self.Point(0, 0);
    p.addParents(measureX, measureY);
    p.update = function() {
      this.x = this.parents[0].value;
      this.y = this.parents[1].value;
    };
    p.update();
    return p;
  },

  /**
   * Create a Point offset from another Point
   * @param  {Point} point 
   * @param  {Number} offX  
   * @param  {Number} offY  
   * @return {Point}       
   */
  pointOffsetNumberNumber: function(point, offX, offY) {
    var p = new self.Point(0, 0);
    p.addParents(point, offX, offY);
    p.update = function() {
      this.x = this.parents[0].x + this.parents[1];
      this.y = this.parents[0].y + this.parents[2];
    }
    p.update();
    return p;
  },

  /**
   * Create a Point offset from another Point
   * @param  {Point} point 
   * @param  {Number} offX  
   * @param  {Measure} offY  
   * @return {Point}       
   */
  pointOffsetNumberMeasure: function(point, offX, offY) {
    var p = new self.Point(0, 0);
    p.addParents(point, offX, offY);
    p.update = function() {
      this.x = this.parents[0].x + this.parents[1];
      this.y = this.parents[0].y + this.parents[2].value;
    }
    p.update();
    return p;
  },

  /**
   * Create a Point offset from another Point
   * @param  {Point} point 
   * @param  {Measure} offX  
   * @param  {Number} offY  
   * @return {Point}       
   */
  pointOffsetMeasureNumber: function(point, offX, offY) {
    var p = new self.Point(0, 0);
    p.addParents(point, offX, offY);
    p.update = function() {
      this.x = this.parents[0].x + this.parents[1].value;
      this.y = this.parents[0].y + this.parents[2];
    }
    p.update();
    return p;
  },

  /**
   * Create a Point offset from another Point
   * @param  {Point} point 
   * @param  {Measure} offX  
   * @param  {Measure} offY  
   * @return {Point}       
   */
  pointOffsetMeasureMeasure: function(point, offX, offY) {
    var p = new self.Point(0, 0);
    p.addParents(point, offX, offY);
    p.update = function() {
      this.x = this.parents[0].x + this.parents[1].value;
      this.y = this.parents[0].y + this.parents[2].value;
    }
    p.update();
    return p;
  },

  /**
   * Create a Point offset polar coordinates from another Point
   * @param  {Point} point
   * @param  {Number} length
   * @param  {Number} angle
   * @return {Point}
   */
  pointOffsetPolarNumberNumber: function(point, length, angle) {
    var p = new self.Point(0, 0);
    p.addParents(point, length, angle);
    p.update = function() {
      this.x = this.parents[0].x + this.parents[1] * Math.cos(this.parents[2]);
      this.y = this.parents[0].y + this.parents[1] * Math.sin(this.parents[2]);
    };
    p.update();
    return p;
  },

  /**
   * Create a Point offset polar coordinates from another Point
   * @param  {Point} point
   * @param  {Number} length
   * @param  {Measure} angle
   * @return {Point}
   */
  pointOffsetPolarNumberMeasure: function(point, length, angle) {
    var p = new self.Point(0, 0);
    p.addParents(point, length, angle);
    p.update = function() {
      this.x = this.parents[0].x + this.parents[1] * Math.cos(this.parents[2].value);
      this.y = this.parents[0].y + this.parents[1] * Math.sin(this.parents[2].value);
    };
    p.update();
    return p;
  },

  /**
   * Create a Point offset polar coordinates from another Point
   * @param  {Point} point
   * @param  {Measure} length
   * @param  {Number} angle
   * @return {Point}
   */
  pointOffsetPolarMeasureNumber: function(point, length, angle) {
    var p = new self.Point(0, 0);
    p.addParents(point, length, angle);
    p.update = function() {
      this.x = this.parents[0].x + this.parents[1].value * Math.cos(this.parents[2]);
      this.y = this.parents[0].y + this.parents[1].value * Math.sin(this.parents[2]);
    };
    p.update();
    return p;
  },

  /**
   * Create a Point offset polar coordinates from another Point
   * @param  {Point} point
   * @param  {Measure} length
   * @param  {Measure} angle
   * @return {Point}
   */
  pointOffsetPolarMeasureMeasure: function(point, length, angle) {
    var p = new self.Point(0, 0);
    p.addParents(point, length, angle);
    p.update = function() {
      this.x = this.parents[0].x + this.parents[1].value * Math.cos(this.parents[2].value);
      this.y = this.parents[0].y + this.parents[1].value * Math.sin(this.parents[2].value);
    };
    p.update();
    return p;
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
    p.update = function() {
      this.x = this.parents[0].x0 + this.parents[1] * (this.parents[0].x1 - this.parents[0].x0);
      this.y = this.parents[0].y0 + this.parents[1] * (this.parents[0].y1 - this.parents[0].y0);
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
    p.update = function() {
      this.x = this.parents[0].x0 + this.parents[1].value * (this.parents[0].x1 - this.parents[0].x0);
      this.y = this.parents[0].y0 + this.parents[1].value * (this.parents[0].y1 - this.parents[0].y0);
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
    s.subtype = self.C.POINT;
    s.addParents(line, parameterSet);
    s.update = function() {
      for (var i = 0; i < this.length; i++) {
        this.items[i].x = this.parents[0].x0 + this.parents[1].items[i] * (this.parents[0].x1 - this.parents[0].x0);
        this.items[i].y = this.parents[0].y0 + this.parents[1].items[i] * (this.parents[0].y1 - this.parents[0].y0);
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
    p.parameter = parameter;
    p.update = function() {
      var a = (this.parameter % 1) * self.C.TAU;
      this.x = this.parents[0].x + this.parents[0].r * Math.cos(a);
      this.y = this.parents[0].y + this.parents[0].r * Math.sin(a);
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
    p.update = function() {
      var a = (this.parents[1].value % 1) * self.C.TAU;
      this.x = this.parents[0].x + this.parents[0].r * Math.cos(a);
      this.y = this.parents[0].y + this.parents[0].r * Math.sin(a);
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
    s.subtype = self.C.POINT;
    s.addParents(circle, parameterSet);
    s.update = function() {
      for (var i = 0; i < this.length; i++) {
        var a = (this.parents[1].items[i] % 1) * self.C.TAU;
        this.items[i].x = this.parents[0].x + this.parents[0].r * Math.cos(a);
        this.items[i].y = this.parents[0].y + this.parents[0].r * Math.sin(a);
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
    p.update = function() {
      var a = self.U.angleBetweenCoordinates(this.parents[1].x, this.parents[1].y,
        this.parents[0].x, this.parents[0].y);
      this.x = this.parents[1].x + this.parents[1].r * Math.cos(a);
      this.y = this.parents[1].y + this.parents[1].r * Math.sin(a);
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
    }; 
    p.update();
    return p;
  },

  /**
   * Returns the intersection Points of a Line and a Circle
   * @param  {Line} line   
   * @param  {Circle} circle 
   * @return {Set(Point)}
   * @ref http://stackoverflow.com/a/1084899
   * @TODO UPDATE FUNCTION SHOULD BE OPTIMIZED
   */
  pointIntersectionlLineCircle: function(line, circle) {
    var s = new self.Set([new self.Point(0, 0), new self.Point(0, 0)]);
    s.subtype = self.C.POINT;
    s.addParents(line, circle);
    s.update = function() {
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
        // console.log('No line-circle intersection');
        this.items[0].x = this.items[0].y = this.items[1].x = this.items[1].y = 0;
      } else {
        var sq = Math.sqrt(disc),
            t0 = (-b - sq) / (2 * a),
            t1 = (-b + sq) / (2 * a);
        this.items[0].x = this.parents[0].x0 + t0 * dx;
        this.items[0].y = this.parents[0].y0 + t0 * dy;
        this.items[1].x = this.parents[0].x0 + t1 * dx;
        this.items[1].y = this.parents[0].y0 + t1 * dy;
      }
    };
    s.update();
    return s;
  },

  /**
   * Returns the intersection Points of two Circles
   * @param  {Circle} circle0 
   * @param  {Circle} circle1 
   * @return {Point}
   * @ref http://www.ambrsoft.com/TrigoCalc/Circles2/Circle2.htm
   */
  pointIntersectionlCircleCircle: function(circle0, circle1) {
    var s = new self.Set([new self.Point(0, 0), new self.Point(0, 0)]);
    s.subtype = self.C.POINT;
    s.addParents(circle0, circle1);
    s.update = function() {
      var x0 = this.parents[0].x,
          y0 = this.parents[0].y,
          r0 = this.parents[0].r,
          x1 = this.parents[1].x,
          y1 = this.parents[1].y,
          r1 = this.parents[1].r;
      var D = self.U.distanceBetweenCoordinates(x0, y0, x1, y1);
      if (r0 + r1 < D || Math.abs(r0 - r1) > D) {
        // console.log('No circle-circle intersection');
        this.items[0].x = this.items[0].y = this.items[1].x = this.items[1].y = 0;
      } else {
        var delta = Math.sqrt( (D + r0 + r1) * (D + r0 - r1)
            * (D - r0 + r1) * (-D + r0 + r1) ) / 4;
        var XX = (x0 + x1) / 2 + (x1 - x0) * (r0 * r0 - r1 * r1) / (2 * D * D),
            xx = 2 * (x0 - x1) * delta / (D * D),
            YY = (y0 + y1) / 2 + (y1 - y0) * (r0 * r0 - r1 * r1) / (2 * D * D),
            yy = 2 * (y0 - y1) * delta / (D * D);
        // this.items[0].x = (x0 + x1) / 2 + (x1 - x0) * (r0 * r0 - r1 * r1) / (2 * D * D)
        //     + 2 * (y0 - y1) * delta / (D * D);
        // this.items[0].y = (y0 + y1) / 2 + (y1 - y0) * (r0 * r0 - r1 * r1) / (2 * D * D)
        //     - 2 * (x0 - x1) * delta / (D * D);
        this.items[0].x = XX + yy;
        this.items[0].y = YY - xx;
        this.items[1].x = XX - yy;
        this.items[1].y = YY + xx;
      }
    };
    s.update();
    return s;
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
    lin.update = function() {
      this.x0 = this.parents[0].x;
      this.y0 = this.parents[0].y;
      this.x1 = this.parents[1].x;
      this.y1 = this.parents[1].y;
    };
    lin.update();
    return lin;
  },

  /**
   * Create a Line Set from a Point to a Point Set
   * @param  {Point} startPoint 
   * @param  {Set(Point)} pointSet
   * @return {Set(Line)} 
   */
  lineFromPointToPointset: function(startPoint, pointSet) {
    var items = [];
    for (var l = pointSet.length, i = 0; i < l; i++) {
      items.push(new self.Line(0, 0, 0, 0));
    }
    var s = new self.Set(items);
    s.subtype = self.C.LINE;
    s.addParents(startPoint, pointSet);
    s.update = function() {
      for (var i = 0; i < this.length; i++) {
        this.items[i].x0 = this.parents[0].x;
        this.items[i].y0 = this.parents[0].y;
        this.items[i].x1 = this.parents[1].items[i].x;
        this.items[i].y1 = this.parents[1].items[i].y;
      }
    };
    s.update();
    return s;
  },

  /**
   * Create a Line Set from a Point Set to a Point Set
   * @param  {Set(Point)} startPS 
   * @param  {Set(Point)} endPS   
   * @return {Set(Line)}         
   * @todo The update function looks like it was barfed...
   */
  lineFromPointsetToPointset: function(startPS, endPS) {
    var items = [],
        maxlen = startPS.length > endPS.length ? startPS.length : endPS.length;
    for (var i = 0; i < maxlen; i++) {
      items.push(new self.Line(0, 0, 0, 0));
    }
    var s = new self.Set(items);
    s.subtype = self.C.LINE;
    s.addParents(startPS, endPS);
    s.update = function() {
      var sl = this.parents[0].length,
          el = this.parents[1].length,
          j = 0,
          k = 0;
      for (var i = 0; i < this.length; i++) {
        this.items[i].x0 = this.parents[0].items[j].x;
        this.items[i].y0 = this.parents[0].items[j++].y;
        this.items[i].x1 = this.parents[1].items[k].x;
        this.items[i].y1 = this.parents[1].items[k++].y;
        if (j >= sl) j--;
        if (k >= el) k--;
      }
    };
    s.update();
    return s;
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
    lin.length = length;
    lin.angle = angle;
    lin.update = function() {
      this.x0 = this.parents[0].x;
      this.y0 = this.parents[0].y;
      this.x1 = this.x0 + this.length * Math.cos(this.angle);
      this.y1 = this.y0 + this.length * Math.sin(this.angle);
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
    lin.angle = angle;
    lin.update = function() {
      this.x0 = this.parents[0].x;
      this.y0 = this.parents[0].y;
      this.x1 = this.x0 + this.parents[1].value * Math.cos(this.angle);
      this.y1 = this.y0 + this.parents[1].value * Math.sin(this.angle);
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
      var ang = this.parents[1].subtype == self.C.ANGLE_DEG ?
          this.parents[1].value * self.C.TO_RADS :
          this.parents[1].value;
      this.x0 = this.parents[0].x;
      this.y0 = this.parents[0].y;
      this.x1 = this.x0 + this.length * Math.cos(ang);
      this.y1 = this.y0 + this.length * Math.sin(ang);
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
      var ang = this.parents[2].subtype == self.C.ANGLE_DEG ?
          this.parents[2].value * self.C.TO_RADS :
          this.parents[2].value;
      this.x0 = this.parents[0].x;
      this.y0 = this.parents[0].y;
      this.x1 = this.x0 + this.parents[1].value * Math.cos(ang);
      this.y1 = this.y0 + this.parents[1].value * Math.sin(ang);
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
    c.update = function() {
      this.x = this.parents[0].x;
      this.y = this.parents[0].y;
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
    c.update = function() {
      this.x = this.parents[0].x;
      this.y = this.parents[0].y;
      this.r = this.parents[1].value;
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

  /**
   * Returns the angle in radians between p0 and p1.
   * The result is inverted from regular cartesian coordinates (i.e. positive 
   *   angle is measured clockwise)
   * @param  {Point} p0
   * @param  {Point} p1
   * @return {Number}
   */
  angleBetween2Points: function(p0, p1) {
    return Math.atan2(p1.y - p0.y, p1.x - p0.x);
  },

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
	this.visible = undefined;
  this.name = undefined;
  this.style = self.style;  // apply a style from fallback defaults
};

/**
 * Appends any number of parent objects to this element, and appends this 
 * object to those parents as child
 * @param {Elements} parents Parent objects driving this element as args
 */
this.Element.prototype.addParents = function() {
  for (var l = arguments.length, i = 0; i < l; i++) {

    // if passed argument is an array
    if (self.util.isArray(arguments[i])) {
      
      // if empty array
      if (arguments[i].length == 0) {
        // return;

      // if multiple objects in array
      } else {
        // add nested arrays recursively
        arguments[i].forEach(function(element) {
          this.addParents(element);
        }, this)
        // return;
      }
    }

    // if it is not an array of objects
    else {
      this.parents.push(arguments[i]);
      if (arguments[i].children) {         // if this object has children (i.e. is not a number or an array...)
        arguments[i].children.push(this);  // add this object as child to parent
      } 
    }

  }
  return;
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
  // if (this.name) console.log('updating ' + this.name + ' children:');
	for (var i = 0; i < this.children.length; i++) {
    // console.log('  ' + this.children[i].name);
		this.children[i].update();
    this.children[i].updateChildren();
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
 */
this.Element.prototype.checkStates = function() {
  // if nothing changed the visible flag, set it to the global default
  if (this.visible == undefined) {    
    this.visible = self.drawVisible;
  }
};

/**
 * Sets the current style of this object
 * @param {Style} style
 */
this.Element.prototype.setStyle = function(style) {
  this.style = style;
};

/**
 * Searches for this element in the global window objects and retrieves its 
 * property as object name
 * @return {boolean} Returns true if found an instance of this object
 */
this.Element.prototype.findName = function() {
  for (var a in window) {
    if (window[a] == this) {    // deprecation warning ?!
    // if (navigator[a] == this) {
      this.name = a;
      return a;
    }
  }
  return false;
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
	this.r = 1;                // for representation when visible
  this.visible = false;      // points won't be renderable by default

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
 * TEMPORARY, functionality should be incorporated as a base constructor
 * @type {[type]}
 */
this.Point.fromMeasures = function(xpos, ypos) {
  if (xpos.type == self.C.MEASURE && ypos.type == self.C.MEASURE) {
    return self.G.pointFromTwoMeasures(xpos, ypos);
  }

  // not cool
  console.error('Sketchpad: invalid arguments for Point.fromMeasures');
  return undefined;
}

/**
 * A constructor method to create a Point along certain Geometry
 * The method discriminates valid geometric/numeric inputs, and returns the possible
 * Point/s (if possible)
 * @param  {Geometry} geom
 * @param  {Number} parameter
 * @return {Point}
 */
this.Point.along = function(geom, parameter) {
  //PAN'S COMMENTS
  //if (!geom.along) return null;
  //return geom.along(parameter);

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

/**
 * A constructor method to create a Point as an offset of another Point
 * @param  {Point} point 
 * @param  {Number/Measure} offX  
 * @param  {Number/Measure} offY  
 * @return {Point}       
 */
this.Point.offset = function(point, offX, offY) {

  // POINT, NUMBER, NUMBER
  if (point.type == self.C.POINT && self.util.isNumber(offX) && self.util.isNumber(offY)) {
    return self.G.pointOffsetNumberNumber(point, offX, offY);
  }

  // POINT, MEASURE, NUMBER
  else if (point.type == self.C.POINT && offX.type == self.C.MEASURE && self.util.isNumber(offY)) {
    return self.G.pointOffsetMeasureNumber(point, offX, offY);
  }

  // POINT, NUMBER, MEASURE
  else if (point.type == self.C.POINT && self.util.isNumber(offX) && offY.type == self.C.MEASURE) {
    return self.G.pointOffsetNumberMeasure(point, offX, offY);
  }

  // POINT, MEASURE, MEASURE
  else if (point.type == self.C.POINT && offX.type == self.C.MEASURE && offY.type == self.C.MEASURE) {
    return self.G.pointOffsetMeasureMeasure(point, offX, offY);
  }

  // not cool
  console.error('Sketchpad: invalid arguments for Point.offset');
  return undefined;
};

/**
 * A constructor method to create a Point as an offset with polar coordinates of another Point
 * @param  {Point} point
 * @param  {Number/Measure} length
 * @param  {Number/Measure} angle
 * @return {Point}
 */
this.Point.offsetPolar = function(point, length, angle) {
  // POINT, NUMBER, NUMBER
  if (point.type == self.C.POINT && self.util.isNumber(length) && self.util.isNumber(angle)) {
    return self.G.pointOffsetPolarNumberNumber(point, length, angle);
  }

  // POINT, MEASURE, NUMBER
  else if (point.type == self.C.POINT && length.type == self.C.MEASURE && self.util.isNumber(angle)) {
    return self.G.pointOffsetPolarMeasureNumber(point, length, angle);
  }

  // POINT, NUMBER, MEASURE
  else if (point.type == self.C.POINT && self.util.isNumber(length) && angle.type == self.C.MEASURE) {
    return self.G.pointOffsetPolarNumberMeasure(point, length, angle);
  }

  // POINT, MEASURE, MEASURE
  else if (point.type == self.C.POINT && length.type == self.C.MEASURE && angle.type == self.C.MEASURE) {
    return self.G.pointOffsetPolarMeasureMeasure(point, length, angle);
  }

  // not cool
  console.error('Sketchpad: invalid arguments for Point.offset');
  return undefined;
}





// ███╗   ██╗ ██████╗ ██████╗ ███████╗ ██████╗ █████╗ ██╗      ██████╗
// ████╗  ██║██╔═══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗██║     ██╔════╝
// ██╔██╗ ██║██║   ██║██║  ██║█████╗  ██║     ███████║██║     ██║     
// ██║╚██╗██║██║   ██║██║  ██║██╔══╝  ██║     ██╔══██║██║     ██║     
// ██║ ╚████║╚██████╔╝██████╔╝███████╗╚██████╗██║  ██║███████╗╚██████╗
// ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝

/**
 * A library to store all independent Node construction functions
 * @type {Object}
 */
this.N = {

  /**
   * Creates a Node constrained to a Line object
   * @param  {Line} line           
   * @param  {number} startParameter 
   * @return {Node}                
   */
  nodeOnLine: function(line, startParameter, options) {
    var n = new self.Node(0, 0);
    var clamp = options ? (options['clamp'] || false) : false;
    var u = startParameter || 0.5;
    if (clamp) u = self.util.clampValue(u, 0, 1);

    n.addParents(line, u, clamp);
    n.update = function() {
      this.x = this.parents[0].x0 + this.parents[1] * (this.parents[0].x1 - this.parents[0].x0);
      this.y = this.parents[0].y0 + this.parents[1] * (this.parents[0].y1 - this.parents[0].y0);
    };
    n.setPosition = function(xpos, ypos) {
      // from given x y posisitons, calculated constrained parameter along line by projection
      // TODO: merge this somehow with the projectPointOnLine method?
      var dlx = this.parents[0].x1 - this.parents[0].x0,
          dly = this.parents[0].y1 - this.parents[0].y0,
          dpx = xpos - this.parents[0].x0,
          dpy = ypos - this.parents[0].y0,
          l = self.U.lineLength(this.parents[0]);
      this.parents[1] = (dlx * dpx + dly * dpy) / (l * l);
      if (this.parents[2]) {
        this.parents[1] = self.util.clampValue(this.parents[1], 0, 1);
      } 
      this.update();
    };
    n.update();
    return n;
  },

  /**
   * Creates a Node constrained to a Circle object
   * @param  {Circle} circle         
   * @param  {number} startParameter 
   * @return {Node}                
   */
  nodeOnCircle: function(circle, startParameter, options) {
    var n = new self.Node(0, 0);
    var u = startParameter || 0;
    n.addParents(circle, u);
    n.update = function() {
      var a = (this.parents[1] % 1) * self.C.TAU;
      this.x = this.parents[0].x + this.parents[0].r * Math.cos(a);
      this.y = this.parents[0].y + this.parents[0].r * Math.sin(a);
    };
    n.setPosition = function (xpos, ypos) {
      var a = self.U.angleBetweenCoordinates(this.parents[0].x, this.parents[0].y, xpos, ypos);
      this.parents[1] = a / self.C.TAU;
      this.update();
    };
    n.update();
    return n;
  },

  /**
   * Creates a Node constrained to X movement
   * @param  {Number} startX 
   * @param  {Number} fixY   
   * @return {Node}        
   */
  nodeHorizontalMovementFromNumber: function(startX, fixY) {
    var n = new self.Node(0, 0);
    n.addParents(startX, fixY);
    n.update = function() {
      this.x = this.parents[0];
      this.y = this.parents[1];
    };
    n.setPosition = function(x, y) {
      this.parents[0] = x;
      this.update();
    };
    n.update();
    return n;
  },

  /**
   * Creates a Node constrained to X movement
   * @param  {Number} startX 
   * @param  {Measure} fixY   
   * @return {Node}        
   */
  nodeHorizontalMovementFromMeasure: function(startX, fixY) {
    var n = new self.Node(0, 0);
    n.addParents(startX, fixY);
    n.update = function() {
      this.x = this.parents[0];
      this.y = this.parents[1].value;
    };
    n.setPosition = function(x, y) {
      this.parents[0] = x;
      this.update();
    };
    n.update();
    return n;
  },

  /**
   * Creates a Node constrained to Y movement
   * @param  {Number} fixX   
   * @param  {Number} startY 
   * @return {Node}        
   */
  nodeVerticalMovementFromNumber: function(fixX, startY) {
    var n = new self.Node(0, 0);
    n.addParents(fixX, startY);
    n.update = function() {
      this.x = this.parents[0];
      this.y = this.parents[1];
    };
    n.setPosition = function(x, y) {
      this.parents[1] = y;
      this.update();
    };
    n.update();
    return n;
  },

  /**
   * Creates a Node constrained to Y movement
   * @param  {Number} fixX   
   * @param  {Measure} startY 
   * @return {Node}        
   */
  nodeVerticalMovementFromMeasure: function(fixX, startY) {
    var n = new self.Node(0, 0);
    n.addParents(fixX, startY);
    n.update = function() {
      this.x = this.parents[0].value;
      this.y = this.parents[1];
    };
    n.setPosition = function(x, y) {
      this.parents[1] = y;
      this.update();
    };
    n.update();
    return n;
  }

};
 




// ███╗   ██╗ ██████╗ ██████╗ ███████╗
// ████╗  ██║██╔═══██╗██╔══██╗██╔════╝
// ██╔██╗ ██║██║   ██║██║  ██║█████╗  
// ██║╚██╗██║██║   ██║██║  ██║██╔══╝  
// ██║ ╚████║╚██████╔╝██████╔╝███████╗
// ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝
/**
 * Base Node class, represents a Point object that can be dragged under its free constrains
 * @param {Number} xpos 
 * @param {Number} ypos 
 */
this.Node = function(xpos, ypos) {
  self.Point.call(this, xpos, ypos);

  // this.type = self.C.NODE;   // keep POINT type to be processed by other methods   
  this.subtype = self.C.NODE;
  this.visible = true;
  this.r = 4;  // for representation when visible

  // this.checkStates();
};
this.Node.prototype = Object.create(this.Point.prototype);
this.Node.prototype.constructor = this.Node;

/**
 * A constructor method to create a Node along certain Geometry, keeping the Node's movement
 * constrained to that geometry
 * @param  {Geometry} geom
 * @param  {Number} parameter
 * @return {Point}
 */
this.Node.along = function(geom, startParameter, options) {

  // shim Measure inputs
  if (startParameter.type == self.C.MEASURE) {
    console.warn('Sketchpad: setting a Measure for Node.along would allow no degrees of freedom in this Node, using Measure.value instead');
    startParameter = startParameter.value;
  }

  // along a line
  if (geom.type == self.C.LINE && self.util.isNumber(startParameter)) {
    return self.N.nodeOnLine(geom, startParameter, options);
  }

  // along circle
  else if (geom.type == self.C.CIRCLE && self.util.isNumber(startParameter)) {
    return self.N.nodeOnCircle(geom, startParameter, options);
  }

  // not cool
  console.error('Sketchpad: invalid arguments for Node.along');
  return undefined;
};


/**
 * A constructor method to create a Node that can only move horizontally
 * @param  {Number} startX The starting X position of the Node
 * @param  {Number/Measure} fixY The constrained Height
 * @return {Node}
 */
this.Node.horizontal = function(startX, fixY) {

  // shim Measure inputs
  if (startX.type == self.C.MEASURE) {
    console.warn('Sketchpad: setting a Measure for startX in Node.horizontal would allow no degrees of freedom in this Node, using Measure.value instead');
    startX = startX.value;
  };

  // defined by two numeric value
  if (self.util.isNumber(startX) && self.util.isNumber(fixY)) {
    return self.N.nodeHorizontalMovementFromNumber(startX, fixY);
  }

  // defined by a Number and a Measure
  else if (self.util.isNumber(startX) && fixY.type == self.C.MEASURE) {
    return self.N.nodeHorizontalMovementFromMeasure(startX, fixY);
  }

  // not cool
  console.error('Sketchpad: invalid arguments for Node.horizontal');
  return undefined;
}


this.Node.vertical = function(fixX, startY) {

  // shim Measure inputs
  if (startY.type == self.C.MEASURE) {
    console.warn('Sketchpad: setting a Measure for startY in Node.horizontal would allow no degrees of freedom in this Node, using Measure.value instead');
    startY = startY.value;
  };

  // defined by two numeric value
  if (self.util.isNumber(fixX) && self.util.isNumber(startY)) {
    return self.N.nodeVerticalMovementFromNumber(fixX, startY);
  }

  // defined by a Number and a Measure
  else if (fixX.type == self.C.MEASURE && self.util.isNumber(startY)) {
    return self.N.nodeVerticalMovementFromMeasure(fixX, startY);
  }

  // not cool
  console.error('Sketchpad: invalid arguments for Node.horizontal');
  return undefined;
}







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
 * @param  {Geometry} element0
 * @param  {Geometry} element1
 * @return {Line}
 */
this.Line.between = function(element0, element1) {
  // point to point
  if (element0.type == self.C.POINT && element1.type == self.C.POINT) {
    return self.G.lineFromTwoPoints(element0, element1);
  }
  // point to pointSet
  else if (element0.type == self.C.POINT 
      && element1.type == self.C.SET 
      && element1.subtype == self.C.POINT) {
    return self.G.lineFromPointToPointset(element0, element1);
  }
  // pointSet to pointSet
  else if (element0.type == self.C.SET && element0.subtype == self.C.POINT
      && element1.type == self.C.SET && element1.subtype == self.C.POINT) {
    return self.G.lineFromPointsetToPointset(element0, element1);
  }
  // not cool
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
   * Returns a Measure object that measures the width of the canvas div
   * @return {Measure}
   */
  canvasWidth: function() {
    var m = new self.Measure(0);
    // (no parents, update is triggered by eventhandler)
    m.update = function() {
      this.value = $(self.parentDiv).innerWidth();
    };
    m.update();
    return m;
  },

  /**
   * Returns a Measure object that measures the height of the canvas div
   * @return {Measure}
   */
  canvasHeight: function() {
    var m = new self.Measure(0);
    // (no parents, update is triggered by eventhandler)
    m.update = function() {
      this.value = $(self.parentDiv).innerHeight();
    };
    m.update();
    return m;
  },

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
    m.subtype = self.C.ANGLE_RAD;
    m.update = function() {
      this.value = self.U.angleBetween3Points(this.parents[0], this.parents[1], this.parents[2]);
    };
    m.update();
    return m;
  },

  /**
   * Returns a Measure whose value is derived from a set of parent Measures and a transform function that relates their value
   * @param  {Array} paramArray   Array of Measure objects 
   * @param  {Function} transFunc  A Function that gets passed this object's parents and returns the computed value of this measure 
   * @return {Measure} 
   */
  transformMeasure: function(paramArray, transFunc) {
    var m = new self.Measure(0);
    m.addParents(paramArray);
    m.subtype = self.C.LENGTH;
    m.transFunc = transFunc;
    m.update = function() {
      this.value = this.transFunc(this.parents);
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

/**
 * A constructor method to measure the angle between several objects
 * @param  {Geometry...} elements 
 * @return {Measure}          
 */
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
};


/**
 * A constructor method to compose a Measure derived from a set of parent Objects
 *   and a transform function that relates them. 
 * The function is in the form of 
 *   Measure.compose(obj0, [obj1, obj2 ...], transformFunction)
 * The transform function gets passed an array with all the parent Objects, 
 *   and can reference their properties of by accessing the passed array:
 *   var area = Measure.compose(width, height, function(elems) { 
 *     return width.value * height.value; 
 *     // return elems[0].value - elems[1].value;  // alternatively
 *   });
 * @param {Object... Function} args
 * @return {Measure}
 */
this.Measure.compose = function(args) {
  var a = arguments,
      len = a.length;

  if (len < 2) {
    console.error('Sketchpad: invalid amount of arguments for Measure.compose, must contain at least one Measure and one transform function');
    return undefined; 
  };

  // Actually, being able to reference any field in a parent object is kind of nice
  // for (var i = 0; i < len - 1; i++) {
  //   if (a[i].type != self.C.MEASURE) {
  //     console.error('Sketchpad: sorry, at the moment Measure.from only supports Measure objects as input arguments');
  //     return undefined;
  //   }
  // };

  if (!self.util.isFunction(a[len - 1])) {
    console.error('Sketchpad: last argument at Measure.compose must be a function');
    return undefined;
  };


  // arguments should not be sliced: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
  var inputs = [];
  for (var i = 0; i < len - 1; i++) {
    inputs.push(a[i]);
  };
  var trans = a[len - 1];

  return self.M.transformMeasure(inputs, trans);
};


/*
More candidates:
  . Measure.length
  . Measure.perimeter
  . Measure.area
  . Measure.angle
  . Measure.add(meas0, meas1, meas2...)  // adds several measures linearly
  . Measure.min(measure, measure)
  . Measure.max(measure, measure)  
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
  for (var l = this.items.length, i = 0; i < l; i ++) {
    if (this.items[i].parents) this.items[i].parents[0] = this;
  }
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
  this.stroke      = styleObj.stroke || '#000000';                  // default is black
  this.strokeWidth = styleObj.strokeWidth || 1.0;
  this.fill        = styleObj.fill                                    // transparent by default
                      ? (styleObj.fill == 'none' ? 'rgba(0, 0, 0, 0)' : styleObj.fill) 
                      : 'rgba(0, 0, 0, 0)' ;
  
  this.fontFamily  = styleObj.fontFamily || 'Times New Roman';
  this.fontSize    = styleObj.fontSize || '9pt';
  this.fontStyle   = styleObj.fontStyle || 'italic';
  this.fontCSS     = styleObj.fontCSS || this.fontStyle + ' ' + this.fontSize + ' ' + this.fontFamily;

  this.textFill    = styleObj.textFill || this.stroke;
  this.textVAlign  = styleObj.textVAlign || 'bottom';
  this.textHAlign  = styleObj.textHAlign || 'center';
  this.textOffsetX = styleObj.textOffsetX || 0;
  this.textOffsetY = styleObj.textOffsetY || -5;

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








// ████████╗ █████╗  ██████╗  ██████╗ ██████╗ ███╗   ██╗███████╗████████╗
// ╚══██╔══╝██╔══██╗██╔════╝ ██╔════╝██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝
//    ██║   ███████║██║  ███╗██║     ██║   ██║██╔██╗ ██║███████╗   ██║   
//    ██║   ██╔══██║██║   ██║██║     ██║   ██║██║╚██╗██║╚════██║   ██║   
//    ██║   ██║  ██║╚██████╔╝╚██████╗╚██████╔╝██║ ╚████║███████║   ██║   
//    ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   
/**
 * A library to store all independent Tag construction functions
 * @type {Object}
 */
this.T = {
  
  /**
   * Returns a Tag from a string linked to a Point
   * @param  {Point} point 
   * @param  {String} text   
   * @return {Tag}
   */
  tagOnPointFromString: function(point, str) {
    var s = str || point.name || point.findName();
    var t = new self.Tag(s, 0, 0);
    t.addParents(point, s);
    t.update = function() {
      this.x = this.parents[0].x;
      this.y = this.parents[0].y;
    };
    t.update();
    return t;
  },

  /**
   * Returns a Tag from a string linked to a Line
   * @param  {Line} line 
   * @param  {String} text   
   * @return {Tag}
   */
  tagOnLineFromString: function(line, str) {
    var s = str || line.name || line.findName();
    var p = self.G.pointOnLine(line, 0.5);
    return self.T.tagOnPointFromString(p, s);
  },

  /**
   * Returns a Tag from a string linked to a Circle
   * @param  {Circle} circle
   * @param  {String} text   
   * @return {Tag}
   */
  tagOnCircleFromString: function(circle, str) {
    var s = str || circle.name || circle.findName();
    var t = new self.Tag(s, 0, 0);
    t.addParents(circle, s);
    t.update = function() {
      this.x = this.parents[0].x;
      this.y = this.parents[0].y;
    };
    t.update();
    return t;
  },

  /**
   * Returns a Tag from a Label linked to a Point
   * @param  {Point} point 
   * @param  {Label} label 
   * @return {Tag}       
   */
  tagOnPointFromLabel: function (point, label) {
    var t = new self.Tag('', 0, 0);
    t.addParents(point, label);
    t.update = function() {
      this.x = this.parents[0].x;
      this.y = this.parents[0].y;
      this.text = this.parents[1].text;
    };
    t.update();
    return t;
  },

  /**
   * Returns a Tag from a Label linked to a Line
   * @param  {Line} line  
   * @param  {Label} label 
   * @return {Tag}       
   */ 
  tagOnLineFromLabel: function(line, label) {
    var t = new self.Tag('', 0, 0);
    var p = self.G.pointOnLine(line, 0.5);
    return self.T.tagOnPointFromLabel(p, label);
  },

  /**
   * Returns a Tag from a Label linked to a Circle
   * @param  {Circle} circle
   * @param  {Label} label
   * @return {Tag}
   */
  tagOnCircleFromLabel: function(circle, label) {
    var t = new self.Tag('', 0, 0);
    t.addParents(circle, label);
    t.update = function() {
      this.x = this.parents[0].x;
      this.y = this.parents[0].y;
      this.text = this.parents[1].text;
    };
    t.update();
    return t;
  }

};






// ████████╗ █████╗  ██████╗ 
// ╚══██╔══╝██╔══██╗██╔════╝ 
//    ██║   ███████║██║  ███╗
//    ██║   ██╔══██║██║   ██║
//    ██║   ██║  ██║╚██████╔╝
//    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ 
/**
 * A basic Tag class representing a text element with visual rendering with optional link to a Geometry object
 */
this.Tag = function(text, xpos, ypos) {
  self.Element.call(this);
  self.addElement(this);

  this.type = self.C.TEXT;
  this.x = xpos;
  this.y = ypos;
  this.text = text;

  this.checkStates();
};
this.Tag.prototype = Object.create(this.Element.prototype);
this.Tag.prototype.constructor = this.Tag;

/**
 * Render method
 */
this.Tag.prototype.render = function() {
  self.gr.fillStyle = this.style.textFill;
  self.gr.textAlign = this.style.textHAlign;
  self.gr.textBaseline = this.style.textVAlign;
  self.gr.font = this.style.fontCSS;
  self.gr.fillText(this.text, this.x + this.style.textOffsetX, this.y + this.style.textOffsetY);
};

/**
 * A constructor method to create a text Tag linked to a Geometry object
 * @param  {Geometry} geom
 * @param  {String} text
 * @return {Tag}
 */
this.Tag.on = function(geom, text) {

  // text tag on a Point
  if ( (geom.type == self.C.POINT || geom.type == self.C.NODE) && self.util.isString(text) ) {
    return self.T.tagOnPointFromString(geom, text);
  }

  // text tag on a Line (midpoint)
  else if (geom.type == self.C.LINE && self.util.isString(text)) {
    return self.T.tagOnLineFromString(geom, text);
  }

  // text tag on a Circle (center)
  else if (geom.type == self.C.CIRCLE && self.util.isString(text)) {
    return self.T.tagOnCircleFromString(geom, text);
  }

  // do not process these guys
  else if ( (geom.type == self.C.TAG || geom.type == self.C.MEASURE) && self.util.isString(text) ) {
    return undefined;
  }


  else if ( (geom.type == self.C.POINT || geom.type == self.C.NODE) && text.type == self.C.LABEL ) {
    return self.T.tagOnPointFromLabel(geom, text);
  }

  else if (geom.type == self.C.LINE && text.type == self.C.LABEL) {
    return self.T.tagOnLineFromLabel(geom, text);
  }

  else if (geom.type == self.C.CIRCLE && text.type == self.C.LABEL) {
    return self.T.tagOnCircleFromLabel(geom, text);
  }

  else if ( (geom.type == self.C.TAG || geom.type == self.C.MEASURE) && text.type == self.C.LABEL ) {
    return undefined;
  }

  // not cool
  console.error('Sketchpad: invalid arguments for Tag.on');
  return undefined;
}







// ██╗      █████╗ ██████╗ ███████╗██╗     
// ██║     ██╔══██╗██╔══██╗██╔════╝██║     
// ██║     ███████║██████╔╝█████╗  ██║     
// ██║     ██╔══██║██╔══██╗██╔══╝  ██║     
// ███████╗██║  ██║██████╔╝███████╗███████╗
// ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝
/**
 * A basic Label class representing a text element linked to other Elements
 */
this.Label = function(text) {
  self.Element.call(this);
  self.addElement(this);

  this.type = self.C.LABEL;
  this.text = text;

};
this.Label.prototype = Object.create(this.Element.prototype);
this.Label.prototype.constructor = this.Label;

/**
 * A constructor method to compose a Label derived from a set of parent Objects
 *   and a transform function that relates them. 
 * The function is in the form of 
 *   Label.compose(obj0, [obj1, obj2 ...], transformFunction)
 * The transform function gets passed an array with all the parent Objects, 
 *   and can reference their properties of by accessing the passed array:
 *   var hDist = Label.compose(A, B, function(elems) { 
 *     return "Horizontal distance: " + (B.x - A.x) + " px"; 
 *     // return "Horizontal distance: " + (elems[1].x - elems[0].x) + " px";  // alternatively
 *   });
 * @param {Object... Function} args
 * @return {Label}
 */
this.Label.compose = function(args) {
  var a = arguments,
      len = a.length;

  if (len < 2) {
    console.error('Sketchpad: invalid amount of arguments for Label.compose, must contain at least one Object and one transform function');
    return undefined; 
  };

  if (!self.util.isFunction(a[len - 1])) {
    console.error('Sketchpad: last argument at Label.compose must be a function');
    return undefined;
  };

  // arguments should not be sliced: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
  var inputs = [];
  for (var i = 0; i < len - 1; i++) {
    inputs.push(a[i]);
  };
  var trans = a[len - 1];

  return self.L.composeLabel(inputs, trans);
};

/**
 * Prototype for a function that returns a Label object from an Element using some default formatting, options and best guesses
 * @param  {Element} element
 * @return {Label}
 */
this.Label.from = function(element, options) {
  if (element.type == self.C.MEASURE) {
    return (options && options.round)
      ? self.Label.compose(element, function() { return Math.round(element.value); })
      : self.Label.compose(element, function() { return element.value; });
  }

  // not cool
  console.error('Sketchpad: invalid arguments for Label.from');
  return undefined;
}

this.L = {

  composeLabel: function(paramArray, transFunc) {
    var l = new self.Label('');
    l.addParents(paramArray, transFunc);
    l.update = function() {
      this.text = this.parents[this.parents.length - 1](this.parents);
    };
    l.update();
    return l;
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
  // init canvas
  this.style = new this.Style({});
  this.gr = this.canvas.getContext('2d');
  this.parentDiv = this.canvas.parentNode;
  this._canvasWidth = $(this.parentDiv).innerWidth();
  this._canvasHeight = $(this.parentDiv).innerHeight();
  this.canvas.width = this._canvasWidth;
  this.canvas.height = this._canvasHeight;

  // create pad.width & pad.height Measure instances
  this.width = this.M.canvasWidth();
  this.height = this.M.canvasHeight();

  // set window.on('resize') eventhandler
  $(window).resize(function() {
    self._canvasWidth = $(self.parentDiv).innerWidth();
    self._canvasHeight = $(self.parentDiv).innerHeight();
    self.canvas.width = self._canvasWidth;
    self.canvas.height = self._canvasHeight;
    self.width.update();
    self.width.updateChildren();
    self.height.update();
    self.height.updateChildren();
  });

  // we are oficially initialized
  this.initialized = true;  // looping kicks in
  if (console.info) console.info("Sketchpad.js " + this.version + ' - Build ' + this.build + '');

  // run one iteration of (overriden) start()
  this.start();

  // kick off main loop() cycle
  this.loop();

} else {
  console.error('Sketchpad: Must initialize Sketchpad with a valid id for a' + 
    ' DOM canvas object, e.g. var pad = new Sketchpad("padCanvasId")');
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

	dist2ToNode: function (x, y, node) {
		return (node.x - x) * (node.x - x) + (node.y - y) * (node.y - y);
	},

	searchNodeToDrag: function (x, y) {
		// for (var len = self.elements.length, i = 0; i < len; i++) {
    for (var i = self.elements.length - 1; i > -1; i--) {  // loop backwards to favour most recent elements
			var elem = self.elements[i];
			if (elem.constructor != self.Node) continue;
			if (this.dist2ToNode(x, y, elem) < 25) return elem;		// <--- SUPER DIRTY, NEEDS IMPROV
		}
		return null;
	},

	onMouseDown: function (e) {
		self.mouse.down = true;
		self.mouse.downX = self.mouse.x;
		self.mouse.downY = self.mouse.y;
		self.mouse.dragObject = self.mouse.searchNodeToDrag(self.mouse.downX, self.mouse.downY);
	},

	onMouseMove: function (e) {
		var offset = $(self.canvas).offset();
		self.mouse.x = e.pageX - offset.left;
		self.mouse.y = e.pageY - offset.top;
		if (self.mouse.dragObject) {
      self.mouse.dragObject.setPosition(self.mouse.x, self.mouse.y);
			// self.mouse.dragObject.x = self.mouse.x;
			// self.mouse.dragObject.y = self.mouse.y;
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






// ██╗   ██╗████████╗██╗██╗     
// ██║   ██║╚══██╔══╝██║██║     
// ██║   ██║   ██║   ██║██║     
// ██║   ██║   ██║   ██║██║     
// ╚██████╔╝   ██║   ██║███████╗
 // ╚═════╝    ╚═╝   ╚═╝╚══════╝

/**
 * A quick utilities library
 * @type {Object}
 */
this.util = {

  /**
   * Underscore's implementation of _.isNumber
   * @param  {Object}  obj
   * @return {Boolean}
   */
  isNumber: function(obj) {
    return toString.call(obj) === '[object Number]';
  },

  /**
   * Underscore's implementation of _.isFunction
   * @param {Object}
   * @return {Boolean}
   */
  isFunction: function(obj) {
    return toString.call(obj) === '[object Function]';
  },

  /**
   * Underscore's implementation of _.isArray
   * @param {Object}
   * @return {Boolean}
   */
  isArray: function(obj) {
    // first try ECMAScript 5 native
    if (Array.isArray) return Array.isArray(obj);

    // else compare array
    return toString.call(obj) === '[object Array]';
  },

  /**
   * Underscore's implementation of _.isString
   * @param  {Object}  obj 
   * @return {Boolean}
   */
  isString: function(obj) {
    return toString.call(obj) === '[object String]';
  },

  /**
   * Clamps a numeric value between two limit extremes
   * @param  {Number} value
   * @param  {Number} min
   * @param  {Number} max
   * @ref http://stackoverflow.com/a/11409944/1934487
   * @return {Number}
   */
  clampValue: function(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

};


};  // END OF SKETCHPAD




/**
 * Provides requestAnimationFrame in a cross browser way.
 * @ref webgl-utils.js
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback, element) {
           return window.setTimeout(callback, 1000/60);
         };
})();




//   ██╗██████╗ 
//  ██╔╝╚════██╗
// ██╔╝  █████╔╝
// ╚██╗  ╚═══██╗
//  ╚██╗██████╔╝
//   ╚═╝╚═════╝ 