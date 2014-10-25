
// ███████╗██╗  ██╗███████╗████████╗ ██████╗██╗  ██╗██████╗  █████╗ ██████╗ ██╗
// ██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝██║  ██║██╔══██╗██╔══██╗██╔══██╗██║
// ███████╗█████╔╝ █████╗     ██║   ██║     ███████║██████╔╝███████║██║  ██║██║
// ╚════██║██╔═██╗ ██╔══╝     ██║   ██║     ██╔══██║██╔═══╝ ██╔══██║██║  ██║╚═╝
// ███████║██║  ██╗███████╗   ██║   ╚██████╗██║  ██║██║     ██║  ██║██████╔╝██╗
// ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝



var sketchpad = new Sketchpad(),
  pad = sketchpad;  // an alias


$(document).ready(function() {
  if (sketchpad.initialized) {
    sketchpad.setup();
    sketchpad.loop();
  }
});



function Sketchpad(canvasId) {
  // all the elements contained in this pad
  this._elements = [];
  
  this.initialized = false;
  this.frameCount = 0;

  // to be overriden by user
  this.setup = function() {

  };

  // to be overriden by user
  this.update = function() {

  };

  // internal rendering function
  this._render = function() {
    // clean the background
    this.gr.globalAlpha = 1.00;
    this.gr.fillStyle = "#FFFFFF";
    this.gr.fillRect(0, 0, this.width, this.height);

    // render each element
    for (var i = 0; i < this._elements.length; i++) {
      this._elements[i]._render(this.gr);
    }
  };

  // main internal initialization fn
  this.initialize = function(canvasId) {
    console.log(this);
    this.canvas = document.getElementById(canvasId);
    this.parentDiv = this.canvas.parentNode;
    this.gr = this.canvas.getContext('2d');

    this.width = $(this.parentDiv).innerWidth();
    this.height = $(this.parentDiv).innerHeight();

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // $(window).resize(function () {
    //  // console.log(this);  // 'this' becomes the window object
    //  this.width = $(this.parentDiv).innerWidth();
       //  this.height = $(this.parentDiv).innerHeight();

       //  this.canvas.width = this.width;
       //  this.canvas.height = this.height;
    // });

    this.initialized = true;
  };

  // main internal loop fn
  this.loop = function() {
    window.requestAnimFrame(sketchpad.loop, sketchpad.canvas);

    sketchpad._render();
    sketchpad.update();

    sketchpad.frameCount++;
  };

};




function Point(xpos, ypos) {
  this.x = xpos;
  this.y = ypos;
  this.r = 5.0;

  sketchpad._elements.push(this);

  this._render = function(gr) {
    gr.lineWidth = 1.0;
    gr.strokeStyle = "#000"; 

    gr.beginPath();
    gr.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    gr.stroke();
  };
};

function PointAt(line, parameter) {

  this.parentLine = line;
  this.parameter = parameter;
 
  // could not find a way to colink two vars into one! 
  this.dx = line.x1 - line.x0;
  this.dy = line.y1 - line.y0;

  this.x = line.x0 + this.parameter * this.dx;
  this.y = line.y0 + this.parameter * this.dy;
  this.r = 5.0;

  sketchpad._elements.push(this);

  this._render = function(gr) {
    gr.lineWidth = 1.0;
    gr.strokeStyle = "#000"; 

    gr.beginPath();
    gr.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    gr.stroke();
  };
};


function Line(startPoint, endPoint) {
  this.x0 = 0;
  this.y0 = 0;
  this.x1 = 0;
  this.y1 = 0;

  CO.linkVariablesOneWay(startPoint, 'x', this, 'x0');
  CO.linkVariablesOneWay(startPoint, 'y', this, 'y0');
  CO.linkVariablesOneWay(endPoint, 'x', this, 'x1');
  CO.linkVariablesOneWay(endPoint, 'y', this, 'y1');

  sketchpad._elements.push(this);

  this._render = function(gr) {
    gr.beginPath();
    gr.lineWidth = 1.0;
    gr.strokeStyle = "#000"; 
    gr.moveTo(this.x0, this.y0);
    gr.lineTo(this.x1, this.y1);
    gr.stroke();
  };
}

function Circle(centerPoint, radius) {
  this.parentPoint = centerPoint;
  this.r = radius;

  this.x = 0;
  this.y = 0;

  CO.linkVariablesOneWay(centerPoint, 'x', this, 'x');
  CO.linkVariablesOneWay(centerPoint, 'y', this, 'y');

  sketchpad._elements.push(this);

  this._render = function(gr) {
    gr.lineWidth = 1.0;
    gr.strokeStyle = "#000"; 

    gr.beginPath();
    gr.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    gr.stroke();
  };

}