
// ███████╗██╗  ██╗███████╗████████╗ ██████╗██╗  ██╗██████╗  █████╗ ██████╗ ██╗
// ██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝██║  ██║██╔══██╗██╔══██╗██╔══██╗██║
// ███████╗█████╔╝ █████╗     ██║   ██║     ███████║██████╔╝███████║██║  ██║██║
// ╚════██║██╔═██╗ ██╔══╝     ██║   ██║     ██╔══██║██╔═══╝ ██╔══██║██║  ██║╚═╝
// ███████║██║  ██╗███████╗   ██║   ╚██████╗██║  ██║██║     ██║  ██║██████╔╝██╗
// ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝

/**
 * Main Sketchpad namespace
 * @type {[type]}
 */
var Sketchpad = Sketchpad || {};


Sketchpad.Canvas = function(canvasId) {
  this.frameCount = 0;

  this.elements = [];
  // this.elementdict={};

  this.initialized = false;

  this.canvas = document.getElementById(canvasId);
  this.parentDiv = this.canvas.parentNode;
  this.gr = this.canvas.getContext('2d');

  this.width = $(this.parentDiv).innerWidth();
  this.height = $(this.parentDiv).innerHeight();
  this.canvas.width = this.width;
  this.canvas.height = this.height;

  $(this.canvas).mousedown(onMouseDown);
  $(this.canvas).mousemove(onMouseMove);
  $(this.canvas).mouseup(onMouseUp);

  // to be overriden by user
  this.setup = function() { };
  this.update = function() { };

    // internal rendering function
  this.render = function() {
    // clean the background
    this.gr.globalAlpha = 1.00;
    this.gr.fillStyle = "#FFFFFF";
    this.gr.fillRect(0, 0, this.width, this.height);

    // render each element
    for (var i = 0; i < this.elements.length; i++) {
      if (!this.elements[i].isVisible) continue;
      this.elements[i].render(this.gr);
    }
  };

  // SOLVE THE LOOP PROBLEM BY STORING THE CONTEXT IN THE CLOSURE
  var that=this;
  
  // main internal loop fn
  this.loop = function() {
    window.requestAnimFrame(pad.loop);

    pad.render();
    pad.update();

    pad.frameCount++;
  };


  return this;
};





Geometry = function() {
  this.parents = [];
  this.children = [];

  this.isVisible = true;

  this.updateChildren = function() {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].update();
    }
  };

  this.setVisible = function(isVisible) {
    this.isVisible = isVisible;
  };
};


Point = function(canvas, xpos, ypos) {
  Geometry.call(this); // call the parent constructor

  this.x = xpos;
  this.y = ypos;
  this.r = 5;

  canvas.elements.push(this);

  this.setPosition = function(xpos, ypos) {
    this.x = xpos;
    this.y = ypos;
    this.updateChildren();
  };

  this.move = function(incX, incY) {
    this.x += incX;
    this.y += incY;



    this.updateChildren();
  };

  this.render = function(gr) {
    gr.lineWidth = 1.0;
    gr.strokeStyle = "#000";
    // gr.fillStyle = '#ddd';
    gr.beginPath();
    gr.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    // gr.fill();
    gr.stroke();
  };
};
Point.prototype = Object.create(Geometry.prototype);
Point.prototype.constructor = Point;


PointAt = function(canvas, parentLine, parameter) {
  Geometry.call(this);

  parentLine.children.push(this);
  canvas.elements.push(this);

  this.parentLine = parentLine;
  this.parameter = parameter;
  this.r = 5;

  this.setParameter = function(parameter) {
    this.parameter = parameter;
    this.update();
    this.updateChildren();
  }

  this.update = function() {
    this.x = this.parentLine.x0 + this.parameter * (this.parentLine.x1 - this.parentLine.x0);
    this.y = this.parentLine.y0 + this.parameter * (this.parentLine.y1 - this.parentLine.y0);
    this.updateChildren();
  };

  this.render = function(gr) {
    gr.lineWidth = 1.0;
    gr.strokeStyle = "#000"; 
    gr.beginPath();
    gr.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    gr.stroke();
  };

  this.update();
};
PointAt.prototype = Object.create(Geometry.prototype);
PointAt.prototype.constructor = PointAt;


Line = function(canvas, startPoint, endPoint) {
  Geometry.call(this);

  startPoint.children.push(this);
  endPoint.children.push(this);
  canvas.elements.push(this);

  this.startPoint = startPoint;
  this.endPoint = endPoint;

  this.render = function(gr) {
    gr.beginPath();
    gr.lineWidth = 1.0;
    gr.strokeStyle = "#000"; 
    gr.moveTo(this.x0, this.y0);
    gr.lineTo(this.x1, this.y1);
    gr.stroke();
  };

  this.update = function() {
    this.x0 = this.startPoint.x;
    this.y0 = this.startPoint.y;
    this.x1 = this.endPoint.x;
    this.y1 = this.endPoint.y;
    this.updateChildren();
  };
  
  // this.x0 = this.startPoint.x;
  // this.y0 = this.startPoint.y;
  // this.x1 = this.endPoint.x;
  // this.y1 = this.endPoint.y;
  this.update();

};
Line.prototype = Object.create(Geometry.prototype);
Line.prototype.constructor = Line;




Circle = function(canvas, centerPoint, radius) {
  Geometry.call(this);

  centerPoint.children.push(this);
  canvas.elements.push(this);

  this.centerPoint = centerPoint;
  this.r = radius;

  this.render = function(gr) {
    gr.lineWidth = 1.0;
    gr.strokeStyle = "#000"; 
    gr.beginPath();
    gr.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    gr.stroke();
  };

  this.update = function() {
    this.x = this.centerPoint.x;
    this.y = this.centerPoint.y;
    this.updateChildren();
  };

  this.update();

};
Circle.prototype = Object.create(Geometry.prototype);
Circle.prototype.constructor = Circle;



Rectangle = function(canvas, basePoint, width, height) {
  Geometry.call(this);

  basePoint.children.push(this);
  canvas.elements.push(this);

  this.basePoint = basePoint;
  this.w = width;
  this.h = height;

  this.render = function(gr) {
    gr.lineWidth = 1.0;
    gr.strokeStyle = "#000"; 
    gr.beginPath();
    gr.rect(this.x0, this.y0, this.w, this.h);
    gr.stroke();
  };

  this.update = function() {
    this.x0 = this.basePoint.x;
    this.y0 = this.basePoint.y;
    this.updateChildren();
  };

  this.update();

};
Rectangle.prototype = Object.create(Geometry.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.pointAtCenter = function(canvas) {

  var p = new Point(canvas, 0, 0);
  this.children.push(p);
  p.parentRectangle = this;
  p.update = function() {
    this.x = this.parentRectangle.x0 + this.parentRectangle.w / 2;
    this.y = this.parentRectangle.y0 + this.parentRectangle.h / 2;
    this.updateChildren();
  };
  p.update();

  return p;
};















// ███╗   ███╗ ██████╗ ██╗   ██╗███████╗███████╗
// ████╗ ████║██╔═══██╗██║   ██║██╔════╝██╔════╝
// ██╔████╔██║██║   ██║██║   ██║███████╗█████╗  
// ██║╚██╔╝██║██║   ██║██║   ██║╚════██║██╔══╝  
// ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝███████║███████╗
// ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝

var mouse = {
  x: 0,
  y: 0,
  down: false,
  downX: 0,
  downY: 0,
  dragObject: null
};

function onMouseDown(e) {
  mouse.down = true;
  mouse.downX = mouse.x;
  mouse.downY = mouse.y;
  mouse.dragObject = searchPointToDrag(mouse.downX, mouse.downY);
};

function onMouseMove(e) {
  var offset = $(pad.canvas).offset();
  mouse.x = e.pageX - offset.left;
  mouse.y = e.pageY - offset.top;
  if (mouse.dragObject) {
    mouse.dragObject.x = mouse.x;
    mouse.dragObject.y = mouse.y;
    mouse.dragObject.updateChildren();
  }
};

function onMouseUp(e) {
  mouse.down = false;
  mouse.dragObject = null;
};


function searchPointToDrag(x, y) {
  for (var len = pad.elements.length, i = 0; i < len; i++) {
    var elem = pad.elements[i];
    if (elem.constructor != Point) continue;
    if (dist2ToPoint(x, y, elem) < 25) return elem;
  }
  return null;
};

function dist2ToPoint(x, y, point) {
  return (point.x - x) * (point.x - x) + (point.y - y) * (point.y - y);
};