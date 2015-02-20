/*
    Copyright (c) 2015, Jose Luis Garcia del Castillo y Lopez
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
    this.build = 1102;

    // jQuery detection
    if (!window.jQuery || !$) {
        console.error('Sketchpad.js depends on jQuery. Please add it to current window context.');
        return undefined;
    }

    // Some private internal constants
    var PI = Math.PI,
        TAU = 2 * Math.PI,
        TO_DEGS = 180 / Math.PI,
        TO_RADS = Math.PI / 180;


    // ██████╗  █████╗ ███████╗███████╗
    // ██╔══██╗██╔══██╗██╔════╝██╔════╝
    // ██████╔╝███████║███████╗█████╗  
    // ██╔══██╗██╔══██║╚════██║██╔══╝  
    // ██████╔╝██║  ██║███████║███████╗
    // ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
        
    // Private properties
    // var self = this;  // store this context ---> @DEPRECATED, use S intead
    var S = this;

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

    var nextId = 1;
    function getId() {
        return nextId++;
    };

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
        S.gr.globalAlpha = 1.00;
        S.gr.fillStyle = "#ffffff";
        S.gr.clearRect(0, 0, S._canvasWidth, S._canvasHeight);
        S.gr.fillRect(0, 0, S._canvasWidth, S._canvasHeight);
        
        // gross workaround to the 1px line aliasing problem: http://stackoverflow.com/a/3279863/1934487
        S.gr.translate(0.5, 0.5);

        // render each element
        for (var i = 0; i < S.elements.length; i++) {
            if (!S.elements[i].visible) continue;

            // render sets: this should be a nested function of some sort (sets of sets?)
            // if (S.elements[i].type == C.SET && S.elements[i].subtype != C.NUMBER) {
                // since elements were added to the parents list anyway, they are rendered
                // so no need to render them again (?)
                // for (var j = 0; j < S.elements[i].length; j++) {
                //   S.elements[i].items[j].render(S.gr);
                // }
            // }

            // or individual elements
            else {
                S.elements[i].render(S.gr);
            }
        }

        // revert the translation
        S.gr.translate(-0.5, -0.5);  
    };

    /**
     * Main internal auto loop function
     */
    this.loop = function() {
        window.requestAnimFrame(S.loop);
        S.render();
        S.update();
        S.frameCount++;
    };

    /**
     * Adds an element to the list of linked Elements
     * @param {Element} element 
     */
    this.addElement = function(element) {
        S.elements.push(element);
    };

    /**
     * Sets current drawing style
     * @param  {Style} style 
     * @return {Style} returns current pad style
     * @todo  change to Sketchpad.style()  // getter or setter
     */
    // this.currentStyle = function(style) {
    //     this.style = style || new Style({});
    //     return this.style;
    // };


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
    var Element = function() {

        this.name = undefined;
        this.id = getId();
        this.parents = [];
        this.children = [];

        /**
         * A library to store characteristic Elements conforming or derived from 
         * this Element, store to be computed just once. E.g. 
         *   line.parts.center (Point)
         *   line.parts.length (Measure)
         * @type {Object}
         */
        this.properties = {};
        this.__ = this.properties;

        // Adds this Element to the list manager 
        S.addElement(this);
    };

    // this.element = function() {
    //     return new Element();
    // };

    Element.prototype.update = function(){};

    /**
     * Appends any number of parent objects to this element, and appends this 
     * object to those parents as child
     * @param {Elements} parents Parent objects driving this element as args
     */
    Element.prototype.addParents = function() {
        for (var l = arguments.length, i = 0; i < l; i++) {

            // if passed argument is an array
            if (util.isArray(arguments[i])) {
                
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
     * Test for same as above, but passing an object with objects in properties, to be also added to the .properties object:
     * element.addParentParams({
     *     start: point0,
     *     end: point1
     * })
     */
    Element.prototype.addParentParams = function(parents) {
        for (var key in parents) {
            var obj = parents[key];
            this.parents.push(obj);
            if (obj.children) {
                obj.children.push(this);
            }
            this.__[key] = obj;
        }
    };

    /**
     * Calls the update methods on each children
     * @return {[type]} [description]
     */
    Element.prototype.updateChildren = function() {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].update();
            this.children[i].updateChildren();
        }
    };

    /**
     * Searches for this element in the global window objects and retrieves its 
     * property as object name
     * @return {boolean} Returns true if found an instance of this object
     */
    Element.prototype.findName = function() {
        for (var a in window) {
            if (window[a] == this) {    // deprecation warning ?!
            // if (navigator[a] == this) {
                this.name = a;
                return a;
            }
        }
        return false;
    };











    /**
     * A wrapper for simple numeric values. It makes things easier when used in conjuntion with Measure, so that all methods refer to .value properties 
     * @param {Number} val
     */
    var Value = function(val) {
        Element.call(this);

        this.type = 'value';
        this.value = val;
        this.__.constrained = false;
    };
    Value.prototype = Object.create(Element.prototype);
    Value.prototype.constructor = Value;

    Value.prototype.set = function(newValue) {
        if (this.__.constrained) {
            console.warning('Sketchpad: this Value is constrained, cannot be set to ' + newValue);
            return;
        }
        this.value = newValue;
        this.updateChildren();
    };

    Value.prototype.add = function(offset) {
        if (this.__.constrained) {
            console.warning('Sketchpad: this Value is constrained, cannot be incremented ' + offset);
            return;
        }
        this.value += offset;
        this.updateChildren();
    };

    // public factory
    this.value = function() {
        var a = arguments,
            len = a.length;

        switch(len) {
        case 1:
            if (are.objects(a).ofTypes('number')) {
                return new Value(a[0]);
            };
            break;
        }

        console.error('Sketchpad: invalid arguments for Sketchpad.value');
        return undefined;
    };

    this.value.distance = function() {
        var a = arguments,
            len = a.length;

        switch(len) {
        case 2:
            if (are.objects(a).ofTypes('point', 'point')) {
                return Value.G.distancePointPoint(a[0], a[1]);
            };
            break;
        }

        console.error('Sketchpad: invalid arguments for Sketchpad.value.distance');
        return undefined;
    };

    Value.G = {

        distancePointPoint: function(p0, p1) {
            var v = new Value(0);
            v.subtype = 'length';
            v.addParentParams({
                start: p0,
                end: p1, 
                constrained: true
            });
            v.update = Value.U.distancePointPoint;
            v.update();
            return v;
        }

    };

    Value.U = {

        distancePointPoint: function() {
            var dx = this.__.end.x.value - this.__.start.x.value,
                    dy = this.__.end.y.value - this.__.start.y.value;
            this.value = Math.sqrt(dx * dx + dy * dy);
        }
    };









    //  ██████╗ ███████╗ ██████╗ ███╗   ███╗███████╗████████╗██████╗ ██╗   ██╗
    // ██╔════╝ ██╔════╝██╔═══██╗████╗ ████║██╔════╝╚══██╔══╝██╔══██╗╚██╗ ██╔╝
    // ██║  ███╗█████╗  ██║   ██║██╔████╔██║█████╗     ██║   ██████╔╝ ╚████╔╝ 
    // ██║   ██║██╔══╝  ██║   ██║██║╚██╔╝██║██╔══╝     ██║   ██╔══██╗  ╚██╔╝  
    // ╚██████╔╝███████╗╚██████╔╝██║ ╚═╝ ██║███████╗   ██║   ██║  ██║   ██║   
    //  ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   

    /**
     * A base Geometry class inheriting from Node, superclass for any Node with geometric properties
     * @todo  rethink common properties
     */
    var Geometry = function() {
        Element.call(this);

        this.visible = true;
    };
    Geometry.prototype = Object.create(Element.prototype);
    Geometry.prototype.constructor = Geometry;

    /**
     * Sets the 'visible' property of an object
     * @param {Boolean} isVisible
     */
    Geometry.prototype.setVisible = function(isVisible) {
        this.visible = isVisible;
    };





    // ██████╗  ██████╗ ██╗███╗   ██╗████████╗
    // ██╔══██╗██╔═══██╗██║████╗  ██║╚══██╔══╝
    // ██████╔╝██║   ██║██║██╔██╗ ██║   ██║   
    // ██╔═══╝ ██║   ██║██║██║╚██╗██║   ██║   
    // ██║     ╚██████╔╝██║██║ ╚████║   ██║   
    // ╚═╝      ╚═════╝ ╚═╝╚═╝  ╚═══╝   ╚═╝   

    var Point = function(x, y) {
        Geometry.call(this);

        this.type = 'point';
        // this.visible = false;

        // properties
        this.__.x = x;
        this.__.y = y;
        this.__.r = { value: 1 };

        // aliases
        // not working because primitives are passed by value
        // in the future this can probably be improved with getter/setters
        // this.x = this.__.x.value;
        // this.y = this.__.y.value;
        // this.r = this.__.r.value;

        // temp workaround, referencing the objects
        this.x = this.__.x;
        this.y = this.__.y;
        this.r = this.__.r;

    };
    Point.prototype = Object.create(Geometry.prototype);
    Point.prototype.constructor = Point;

    /**
     * Render method
     */
    Point.prototype.render = function() {
        S.gr.strokeStyle = 'black'
        S.gr.lineWidth = 1;
        S.gr.fillStyle = 'red';

        // S.gr.strokeStyle = this.style.stroke;
        // S.gr.lineWidth = this.style.strokeWidth;
        // S.gr.fillStyle = this.style.fill;

        S.gr.beginPath();
        S.gr.arc(this.x.value, this.y.value, this.r.value, 0, 2 * Math.PI);
        S.gr.stroke();
        S.gr.fill();
    };



    this.point = function() {
        var a = arguments,
            len = a.length;

        switch (len) {
        case 2:
            if (are.objects(a).ofTypes('numeric', 'numeric')) {
                return Point.G.fromNumericNumeric(a[0], a[1]);
            }
            break;
        };

        console.error('Sketchpad: invalid arguments for Sketchpad.point');
        return undefined;
    };

    this.point.along = function() {
        var a = arguments,
            len = a.length;

        switch (len) {
        case 2: 
            if (are.objects(a).ofTypes('line', 'numeric')) {
                return Point.G.onLine(a[0], a[1]);
            }
            break;
        };
        console.error('Sketchpad: invalid arguments for Sketchpad.point.along');
        return undefined;
    }


    Point.G = {

        fromNumericNumeric: function(x, y) {
            var X = util.isNumber(x) ? S.value(x) : x,
                Y = util.isNumber(y) ? S.value(y) : y;
            var p = new Point(X, Y);
            p.addParents(X, Y);
            return p;
        },

        onLine: function(line, parameter) {
            var p = new Point(S.value(0), S.value(0));
            var param = util.isNumber(parameter) ? S.value(parameter) : parameter;
            p.addParentParams({
                line: line,
                parameter: param
            });
            p.update = Point.U.onLine;
            p.update();
            return p;
        }

    };

    Point.U = {

        onLine: function() {
            this.x.value = this.__.line.start.x.value + this.__.parameter.value *
                (this.__.line.end.x.value - this.__.line.start.x.value);
            this.y.value = this.__.line.start.y.value + this.__.parameter.value * 
                (this.__.line.end.y.value - this.__.line.start.y.value);
        }

    };






    // ██╗     ██╗███╗   ██╗███████╗
    // ██║     ██║████╗  ██║██╔════╝
    // ██║     ██║██╔██╗ ██║█████╗  
    // ██║     ██║██║╚██╗██║██╔══╝  
    // ███████╗██║██║ ╚████║███████╗
    // ╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝

    var Line = function(startPoint, endPoint) {
        Geometry.call(this);

        this.type = 'line';

        this.__.start = startPoint;
        this.__.end   = endPoint;

        this.start = this.__.start;
        this.end   = this.__.end;
    };
    Line.prototype = Object.create(Geometry.prototype);
    Line.prototype.constructor = Line;

    /**
     * Render method
     */
    Line.prototype.render = function() {
        S.gr.strokeStyle = 'black';
        S.gr.strokeWidth = 1;
        // S.gr.strokeStyle = this.style.stroke;
        // S.gr.lineWidth = this.style.strokeWidth;
        S.gr.beginPath();
        S.gr.moveTo(this.start.x.value, this.start.y.value);
        S.gr.lineTo(this.end.x.value, this.end.y.value);
        S.gr.stroke();
    };

    this.line = function() {
        var a = arguments,
            len = a.length;

        switch (len) {
        case 2:
            if (are.objects(a).ofTypes('point', 'point')) {
                return Line.G.fromPointPoint(a[0], a[1]);
            }
            break;
        }

        console.error('Sketchpad: invalid arguments for Sketchpad.line');
        return undefined;
    };


    Line.G = {

        fromPointPoint: function(p0, p1) {
            var lin = new Line(p0, p1);
            lin.addParents(p0, p1);
            // no update override needed
            return lin;
        }
    }















































































































    /**
     * An object that implements cascading check of Element types:
     *     if ( are.objects(args).ofTypes('point', 'measure') )
     * @type {Object}
     * @ref http://javascriptissexy.com/beautiful-javascript-easily-create-chainable-cascading-methods-for-expressiveness/
     */
    var are = {
        args: [],

        objects: function(args_) {
            this.args = args_;

            return this;
        },

        ofTypes: function() {
            var types = arguments,
                len = types.length;
            if (!this.args || this.args.length != len) return false;
            for (var l = this.args.length, i = 0; i < l; i++) {
                if (types[i] === 'numeric') {
                    if ( !util.isNumber(this.args[i]) && this.args[i].type !== 'value') return false;

                } else if (types[i] === 'number') {
                    if ( !util.isNumber(this.args[i]) ) return false;

                } else if (types[i] === 'array') {
                    if ( !util.isArray(this.args[i]) ) return false;

                } else if (types[i] === 'function') {
                    if ( !util.isFunction(this.args[i]) ) return false;

                } else if (types[i] === 'string') {
                    if ( !util.isString(this.args[i]) ) return false;

                } else if (this.args[i].type !== types[i]) {
                    return false;    
                } 
            }
            return true;
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
        // this.style = new this.Style({});
        this.gr = this.canvas.getContext('2d');
        this.parentDiv = this.canvas.parentNode;
        this._canvasWidth = $(this.parentDiv).innerWidth();
        this._canvasHeight = $(this.parentDiv).innerHeight();
        this.canvas.width = this._canvasWidth;
        this.canvas.height = this._canvasHeight;

        // create pad.width & pad.height Measure instances
        // this.width = this.M.canvasWidth();
        // this.height = this.M.canvasHeight();

        // set window.on('resize') eventhandler
        $(window).resize(function() {
            S._canvasWidth = $(S.parentDiv).innerWidth();
            S._canvasHeight = $(S.parentDiv).innerHeight();
            S.canvas.width = S._canvasWidth;
            S.canvas.height = S._canvasHeight;
            // S.width.update();
            // S.width.updateChildren();
            // S.height.update();
            // S.height.updateChildren();
        });

        // we are oficially initialized
        this.initialized = true;  // looping kicks in
        if (console.info) console.info("Sketchpad.js " + this.version + ' - Build ' + this.build + '');

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
            // for (var len = S.elements.length, i = 0; i < len; i++) {
            for (var i = S.elements.length - 1; i > -1; i--) {  // loop backwards to favour most recent elements
                var elem = S.elements[i];
                if (elem.constructor != S.Node) continue;
                if (this.dist2ToNode(x, y, elem) < 25) return elem;     // <--- SUPER DIRTY, NEEDS IMPROV
            }
            return null;
        },

        onMouseDown: function (e) {
            S.mouse.down = true;
            S.mouse.downX = S.mouse.x;
            S.mouse.downY = S.mouse.y;
            S.mouse.dragObject = S.mouse.searchNodeToDrag(S.mouse.downX, S.mouse.downY);
        },

        onMouseMove: function (e) {
            var offset = $(S.canvas).offset();
            S.mouse.x = e.pageX - offset.left;
            S.mouse.y = e.pageY - offset.top;
            if (S.mouse.dragObject) {
                S.mouse.dragObject.setPosition(S.mouse.x, S.mouse.y);
                // S.mouse.dragObject.x = S.mouse.x;
                // S.mouse.dragObject.y = S.mouse.y;
                S.mouse.dragObject.updateChildren();
            }
        },

        onMouseUp: function (e) {
            S.mouse.down = false;
            S.mouse.dragObject = null;
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
     * A private quick utilities library
     * @type {Object}
     */
    var util = {

        /**
         * Underscore's implementation of _.isNumber
         * @param  {Object}  obj
         * @return {Boolean}
         */
        isNumber: function(obj) {
            return toString.call(obj) === '[object Number]';
        },

        /**
         * Checks if all elements in an array are numbers
         * @param  {Array} array
         * @return {Boolean}      
         */
        isNumberArray: function(array) {
            for (var l = array.length, i = 0; i < l; i++) {
                if (!util.isNumber(array[i])) return false;
            }
            return true;
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
         * Checks if the object is of type Set
         * @param  {Object}  obj
         * @return {Boolean}
         */
        isSet: function(obj) {
            return obj.type == C.SET;
        },

        /**
         * Checks if the object is of the type Point
         * @param  {Object}  obj
         * @return {Boolean}
         */
        isPoint: function(obj) {
            return obj.type == C.POINT;
        },

        /**
         * Checks if the object is of the type Line
         * @param  {Object}  obj
         * @return {Boolean}     
         */
        isLine: function(obj) {
            return obj.type == C.LINE;
        },

        /**
         * Checks if the object is of the type Circle
         * @param  {Object}  obj
         * @return {Boolean}     
         */
        isCircle: function(obj) {
            return obj.type == C.CIRCLE;
        },

        /**
         * Checks if the object is of the type Measure
         * @param  {Object}  obj
         * @return {Boolean}
         */
        isMeasure: function(obj) {
            return obj.type == C.MEASURE;
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
        },

        map: function(value, sMin, sMax, tMin, tMax, clamp) {
            if (clamp) {
                if (value < sMin) value = sMin;
                else if (value > sMax) value = sMax;
            }
            return tMin + (value - sMin) * (tMax - tMin) / (sMax - sMin);
        }

    };

    // A public alias for the util library
    this.utils = util;






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
