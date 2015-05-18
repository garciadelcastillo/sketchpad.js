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

var Sketchpad = function(canvasId) {

    this.version = "v0.1.0";
    this.build = 1200;

    var DEV = false;

    // jQuery detection
    if (!window.jQuery) {
        console.error('Sketchpad.js currently depends on jQuery. Please add it to current window context.');
        return undefined;
    }



    // ██████╗  █████╗ ███████╗███████╗
    // ██╔══██╗██╔══██╗██╔════╝██╔════╝
    // ██████╔╝███████║███████╗█████╗  
    // ██╔══██╗██╔══██║╚════██║██╔══╝  
    // ██████╔╝██║  ██║███████║███████╗
    // ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
        
    // Private properties
    var S = this;                   // self
    this._elements = [];            // all the Elements this skectch contains
    this._renderableElements = [];  // references to renderable Elements
    this._initialized = false;      // was this correctly initialized
    this._canvas;                   // the html canvas element this Sketchpad is attached to
    this._canvasId;                 // the id of _canvas
    this._gr;                       // graphic context of the canvas
    this._parentNode;               // this canvas' parent node (for width/height calculations)
    this._canvasWidth;              
    this._canvasHeight;
    this._frameCount = 0;           // elapsed frames

    // Public properties
    // this.frameCount = 0;    // @TODO: should this be turned into a method returning a SketchVar?



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
        if (DEV) console.log("Rendering frame " + this._frameCount);
        
        // clean the background
        this._gr.globalAlpha = 1.00;
        this._gr.fillStyle = "#ffffff";
        this._gr.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
        this._gr.fillRect(0, 0, this._canvasWidth, this._canvasHeight);
        
        // gross workaround to the 1px line aliasing problem: http://stackoverflow.com/a/3279863/1934487
        this._gr.translate(0.5, 0.5);

        // render each element
        for (var i = 0; i < S._elements.length; i++) {

        }

        // revert the translation
        this._gr.translate(-0.5, -0.5);  
    };

    /**
     * Main internal auto loop function
     */
    this.loop = function() {
        window.requestAnimFrame(S.loop);
        S.preupdate();
        S.render();
        S.update();
        S._frameCount++;
    };










    // Checks if this object has only one wrapped parent
    var checkConstrainedParenthood = function(obj) {
        if (obj._parents.length == 1 && obj._parents[0]._type == 'varwrap') {
            obj._isConstrained = false;
            obj._wrappedSingleParent = true;
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
     */
    var Element = function(value) {

        // Quasi-private proerties
        this._spobj = true;         // is this a Sketchpad Object?
        this._id = index++;         // unique identifier
        this._parents = [];         // collection of parents
        this._children = [];        // collection of children
        
        this._name = "";
        this._type = "element";

        this._isConstrained = true;
        this._wrappedSingleParent = false;

        this._isArray = false;  // is the _value in this XVAR array-like?
        this._parentLengths = [];
        this._matchPatternType = 'longest-list';  // default behavior
        this._matchPattern = [];  // an array with indices representing the match pattern

        this._preUpdate = null;  // a custom _preUdate function to be run once for special entities (e.g. .random())




        /**
         * Contains references to objects representing characteristic properties of
         * the object. They get registered here upon first creation, and referenced
         * on any subsequent query.
         * @type {Object}
         */
        this._properties = {};

        // Add it to the collection
        this._elements.push(this);


        /**
         * Takes an array of objects, and adds them as parents of this object
         */
        this._makeChildOfParents = function(parents) {
            for (var l = parents.length, i = 0; i < l; i++) {
                var p = parents[i];
                if (!p || !p._spobj) p = wrap(p);  // if parent is falsey (undefined, null) or if parent is not an XVAR, wrap it into one
                this._parents.push(p);
                p._children.push(this);
            }

            // Do some default parent lengths and pattern match
            var patt = [];
            for (var l = parents.length, i = 0; i < l; i++) {
                this._parentLengths.push(0);  // defaults to singletons, should be corrected on first update
                patt.push(-1);
            }
            this._matchPattern.push(patt);

            checkConstrainedParenthood(this);
        };

        /**
         * Add a new object to a characteristic property of this object.
         * It won't overwrite the property if it already exists, unless forced.
         * Returns that property's value.
         * @param  {string} prop
         * @param  {object} obj
         * @param  {boolean} force Force overwriting the property if exists
         * @return {object} the registered object
         */
        this._register = function(prop, obj, force) {
            if (force || !this._properties[prop]) this._properties[prop] = obj;
            return this._properties[prop];
        };


    };































    // ██╗███╗   ██╗██╗████████╗
    // ██║████╗  ██║██║╚══██╔══╝
    // ██║██╔██╗ ██║██║   ██║   
    // ██║██║╚██╗██║██║   ██║   
    // ██║██║ ╚████║██║   ██║   
    // ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   

    // Initialize canvas object
    this._canvasId = canvasId;
    this._canvas = document.getElementById(canvasId);
    if (this._canvas) {
        // init canvas
        // this.style = new this.Style({});
        this._gr = this._canvas.getContext('2d');
        this._parentNode = this._canvas.parentNode;
        this._canvasWidth = $(this._parentNode).innerWidth();
        this._canvasHeight = $(this._parentNode).innerHeight();
        this._canvas.width = this._canvasWidth;
        this._canvas.height = this._canvasHeight;

        // set window.on('resize') eventhandler
        $(window).resize(function() {
            S._canvasWidth = $(S._parentNode).innerWidth();
            S._canvasHeight = $(S._parentNode).innerHeight();
            S._canvas.width = S._canvasWidth;
            S._canvas.height = S._canvasHeight;
        });

        // we are oficially initialized
        this._initialized = true;  // looping kicks in
        if (console.info) console.info("Sketchpad.js " + this.version + ' - Build ' + this.build + '');

        // run one iteration of (overriden) start()
        this.start();

        // kick off main loop() cycle
        this.loop();

    } else {
        console.error('Sketchpad: Must initialize Sketchpad with a valid id for a' + 
            ' DOM canvas object, e.g. var pad = new Sketchpad("padCanvasId")');
        return undefined;
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
            var offset = $(S._canvas).offset();
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

    $(this._canvas).mousedown(this.mouse.onMouseDown);
    $(this._canvas).mousemove(this.mouse.onMouseMove);
    $(this._canvas).mouseup(this.mouse.onMouseUp);


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
