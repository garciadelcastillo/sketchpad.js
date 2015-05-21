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

    var DEV = false;  // Turn development mode on for extra-verbose console logs

    //  ██████╗ ██████╗ ██████╗ ███████╗
    // ██╔════╝██╔═══██╗██╔══██╗██╔════╝
    // ██║     ██║   ██║██████╔╝█████╗  
    // ██║     ██║   ██║██╔══██╗██╔══╝  
    // ╚██████╗╚██████╔╝██║  ██║███████╗
    //  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
    
    // Versioning
    this.version = "v0.1.0";
    this.build = 1200;

    // Incremental id assignment
    var index = 1;  // zero is reserved


    // jQuery detection
    if (!window.jQuery) {
        console.error('Sketchpad.js currently depends on jQuery. Please add it to current window context.');
        return undefined;
    };

    // Set how verbose Sketchpad.js is
    // 0 = no logging, 1 = some help logs
    var log = 1;
    this.logLevel = function(value) {
        if (arguments.length == 0) return log;
        log = value;
    };

    // Some constants
    var TAU = 2 * Math.PI,          // ;)
        TO_DEGS = 180 / Math.PI,
        TO_RADS = Math.PI / 180;















    // ██████╗  █████╗ ███████╗███████╗
    // ██╔══██╗██╔══██╗██╔════╝██╔════╝
    // ██████╔╝███████║███████╗█████╗  
    // ██╔══██╗██╔══██║╚════██║██╔══╝  
    // ██████╔╝██║  ██║███████║███████╗
    // ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
        
    // Pseudo-private properties
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



    /**
     * An 'update' function with code to run on each sketchpad loop.
     * Will be executed AFTER the render fn.
     * Intended to be overriden by the user:
     *   pad.update = function() {
     *     point.move(1, 0);  
     *   };
     */
    this.update = function() { };
    
    /**
     * Same as pad.update(), but is run before the pad.render function.
     * Intended to be overriden by the user.
     */
    this.preupdate = function() { };

    /**
     * Internal start block. Will be run once before first pad.loop() interation.
     * Intended to be overriden by the user.
     */
    this.start = function() { };

    /**
     * The main render function for this Sketchpad.
     */
    this._render = function() {
        if (DEV) console.log("Rendering frame " + this._frameCount);
        
        // Clean the background
        this._gr.globalAlpha = 1.00;
        this._gr.fillStyle = "#ffffff";
        this._gr.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
        this._gr.fillRect(0, 0, this._canvasWidth, this._canvasHeight);
        
        // Gross workaround to the 1px line aliasing problem: http://stackoverflow.com/a/3279863/1934487
        this._gr.translate(0.5, 0.5);

        // Render each element --> TODO: only render Renderable elements
        for (var i = 0; i < S._elements.length; i++) {
            // S._elements[i]._render();
        }

        // Revert the translation
        this._gr.translate(-0.5, -0.5);  
    };

    /**
     * Main internal auto loop function
     */
    this.loop = function() {
        window.requestAnimFrame(S.loop);
        S.preupdate();
        S._render();
        S.update();
        S._frameCount++;
    };












    // ███████╗██╗     ███████╗███╗   ███╗███████╗███╗   ██╗████████╗
    // ██╔════╝██║     ██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝
    // █████╗  ██║     █████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║   
    // ██╔══╝  ██║     ██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   
    // ███████╗███████╗███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   
    // ╚══════╝╚══════╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝

    /**
     * A base Element class from which any associative object inherits.
     * This represents anything that is associative and included in update chains.
     */
    var Element = function() {

        // Pseudo-private properties
        this._padObj = true;                    // is this a Sketchpad Object?
        this._id = index++;                     // unique identifier
        this._parents = [];                     // collection of parents
        this._children = [];                    // collection of children
        this._name = "";                        // given name, usually autotagged from the object's var name in global context
        this._type = "element";                 // element type
        this._isConstrained = true;             // does this object depend on any parent?
        this._wrappedSingleParent = false;      // does this object inherit from a single wrapped parent?

        // Add this element to the main collection
        S._elements.push(this);

        /**
         * Contains references to objects representing characteristic properties of
         * the object, e.g. 'x', 'y', 'center', 'half'...
         * They get registered here upon first creation, and referenced on any subsequent query.
         * @type {Object}
         */
        this._properties = {};

        this._preUpdate = null;  // a custom _preUdate function to be run once for special entities (e.g. .random())


        //  TO REWORK WHEN DOING THE XVARS
        // this._isArray = false;  // is the _value in this XVAR array-like?
        // this._parentLengths = [];
        // this._matchPatternType = 'longest-list';  // default behavior
        // this._matchPattern = [];  // an array with indices representing the match pattern




        /**
         * Takes an array of objects, and adds them as parents of this object
         */
        this._makeChildOfParents = function(parents) {
            for (var l = parents.length, i = 0; i < l; i++) {
                var p = parents[i];
                if (!p || !p._padObj) p = wrap(p);  // if parent is falsey (undefined, null) or if parent is not an XVAR, wrap it into one
                this._parents.push(p);
                p._children.push(this);
            }

            // // Do some default parent lengths and pattern match
            // var patt = [];
            // for (var l = parents.length, i = 0; i < l; i++) {
            //     this._parentLengths.push(0);  // defaults to singletons, should be corrected on first update
            //     patt.push(-1);
            // }
            // this._matchPattern.push(patt);

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

        // A function that encompasses all update actions for this object
        this._updateElement = function(forceDeep) {

            // REVIEW THIS WHEN DOING ARRAY STUFF
                // // Check if size of parents has changed
                // var changed = false;
                // if (forceDeep) {
                //     changed = true;
                // } else {
                //     for (var l = this._parents.length, i = 0; i < l; i++) {
                //         var len = this._parents[i]._isArray ? this._parents[i]._value.length : 0;
                //         if (len != this._parentLengths[i]) {
                //             this._parentLengths[i] = len;  
                //             changed = true;
                //         }
                //     }
                // }

                // // If parents changed in size, update 'arrayness' the matching pattern 
                // if (changed) {
                //     this._checkArrayness();  // flag this XVAR as array-like
                //     this._updateMatchPattern();  // recalculate parent matching pattern
                // }

            // Check if there a _preUpdate funtion was registered, and run it
            if (this._preUpdate) this._preUpdate();

                // // Now call the _update function according to the matching pattern
                // // Call _update passing extracted parent values according to matching pattern
                // if (this._isArray) {
                //     this._value = [];
                //     for (var i = 0; i < this._matchPattern.length; i++) {
                //         var slice = this._parentSlice(this._matchPattern[i]);
                //         this._value.push(this._update(slice, i));
                //     }
                // } else {
                //     var slice = this._parentSlice();
                //     this._value = this._update(slice, 0);
                // }

            var slice = this._parentSlice();
            this._value = this._update(slice, 0);

        };

        // Returns an array with the _value prop of the _parents objs
        // for specified indexArray (pattern matching)
        // THIS COULD BECOME A PRIVATE FUNCTION: var valueSlice = function(parents, indexArray) {...}
        this._parentSlice = function(indexArray) {
            var arr = [];

            // If no index passed (singleton parents)
            if (typeof indexArray === 'undefined') {
                for (var len = this._parents.length, i = 0; i < len; i++) {
                    arr.push(this._parents[i]._value);
                }

            // If array parents 
            } else {
                for (var len = this._parents.length, i = 0; i < len; i++) {
                    arr.push( indexArray[i] === -1 ?   // is singleton?
                            this._parents[i]._value :
                            this._parents[i]._value[indexArray[i]]);
                }
            }

            return arr;
        };

                // Calls updateElement and updateChildren on all object's children
        this._updateChildren = function() {
            this._children.forEach(function(elem) {
                if (DEV) console.log('DEBUG: updating "' + elem._name + '"');
                elem._updateElement();
                elem._updateChildren();
            });
        };

    };


    // Checks if this object has only one wrapped parent
    var checkConstrainedParenthood = function(obj) {
        if (obj._parents.length == 1 && obj._parents[0]._type == 'xwrap') {
            obj._isConstrained = false;
            obj._wrappedSingleParent = true;
        }
    };  




































    // ██╗  ██╗██████╗  █████╗ ███████╗███████╗
    // ╚██╗██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝
    //  ╚███╔╝ ██████╔╝███████║███████╗█████╗  
    //  ██╔██╗ ██╔══██╗██╔══██║╚════██║██╔══╝  
    // ██╔╝ ██╗██████╔╝██║  ██║███████║███████╗
    // ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝

    /**
     * A base class for XVar objects to inherit from
     * Contains the _value property, and the .value gsetters 
     * @param {Object} value 
     */
    var XBase = function(value) {
        Element.call(this);
        this._value = value;
        this._type = 'xbase';
    };
    XBase.prototype = Object.create(Element.prototype);
    XBase.prototype.constructor = XBase;

    // This has better performance than Object.defineProperties(): http://jsperf.com/getter-setter/7
    XBase.prototype = {
        get value() {
            return this._value;
        },
        set value(x) {
            if (this._isConstrained) {
                if (log) console.warn('Sketchpad.js: Sorry, this variable is constrained');
            } else {
                // update for single parented wrapped objects
                if (this._wrappedSingleParent) {
                    this._parents[0].value = x;  

                // update for wrap objects 
                } else {
                    this._value = x;  
                    // this._checkArrayness();
                    this._updateChildren();
                }
            }
        }
    };


    // ██╗  ██╗██╗    ██╗██████╗  █████╗ ██████╗ 
    // ╚██╗██╔╝██║    ██║██╔══██╗██╔══██╗██╔══██╗
    //  ╚███╔╝ ██║ █╗ ██║██████╔╝███████║██████╔╝
    //  ██╔██╗ ██║███╗██║██╔══██╗██╔══██║██╔═══╝ 
    // ██╔╝ ██╗╚███╔███╔╝██║  ██║██║  ██║██║     
    // ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     

    /**
     * A class to wrap primitive values of XVars, and make it
     * easier to refer to _value properties seamlessly everywhere. 
     * @param {Object} value
     */
    var XWrap = function(value) {
        XBase.call(this, value);
        this._type = 'xwrap';
        this._isConstrained = false;
        // this._checkArrayness();  // see if the _value in this element is an array
    };
    XWrap.prototype = Object.create(XBase.prototype);
    XWrap.prototype.constructor = XWrap;

    // Returns the argument wrapped inside a XWRAP object
    var wrap = function(value){
        return new XWrap(value);
    };


    // ██╗  ██╗██╗   ██╗ █████╗ ██████╗ 
    // ╚██╗██╔╝██║   ██║██╔══██╗██╔══██╗
    //  ╚███╔╝ ██║   ██║███████║██████╔╝
    //  ██╔██╗ ╚██╗ ██╔╝██╔══██║██╔══██╗
    // ██╔╝ ██╗ ╚████╔╝ ██║  ██║██║  ██║
    // ╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝

    /**
     * Main XVar class, to create associative variables of any kind
     * @see https://github.com/garciadelcastillo/X.js
     * @param {Object} value
     */
    var XVar = function(value) {
        XBase.call(this, value);
        this._type = 'xvar';
    };
    XVar.prototype = Object.create(XBase.prototype);
    XVar.prototype.constructor = XVar;

    XVar._updates = {
        fromValue: function(p) {
            return p[0];  // retrieve from xvar/xwrapped parent
        },

        //////////////////////////
        // ARITHMETIC FUNCTIONS //
        //////////////////////////

        half: function(p) {
            return 0.5 * p[0];
        },

        double: function(p) {
            return 2 * p[0];
        },
    };

    //////////////////////////////////////////////////
    // AUTO GENERATION OF CHARACTERISTIC PROTOTYPES //
    // (this are all argument-less)                 //
    //////////////////////////////////////////////////
    var XVarProtos = [
        // 'not',
        'half',
        'double',
        // 'abs',
        // 'sqrt',
        // 'sin',
        // 'cos',
        // 'tan',
        // 'round',
        // 'floor',
        // 'ceil',
        // 'toDegrees',
        // 'toRadians',
        // 'length',
        // 'toLowerCase',
        // 'toUpperCase'
    ];

    XVarProtos.forEach(function(prop) {
        XVar.prototype[prop] = function() {
            return typeof this._properties[prop] !== 'undefined' ?
                    this._properties[prop] :
                    this._register(prop, build('xvar', [this], prop));
        };
    });

    //////////////////////
    // BASE CONSTRUCTOR //
    //////////////////////

    this.var = function(value) {
        if (arguments.length != 1) {
            if (log) console.warn('Sketchpad.js: Invalid arguments for sketch.var()');
            return undefined;
        };

        return build('xvar', arguments, 'fromValue');
    };

    // An object mapping Object types to private constructors
    var typeMap = {
        'element'  : Element,
        'xbase'    : XBase,
        'xwrap'    : XWrap,
        'xvar'     : XVar
    };

    // A generic constructor interface to create Sketchpad Objects with type, 
    // args and update function name
    var build = function(TYPE, parents, update, customProps) {
        var obj = new typeMap[TYPE]();                  // construct an object of this type
    
        obj._makeChildOfParents(parents);
        obj._update = typeMap[TYPE]._updates[update];   // choose which update function to bind

        // Add custom properties to object if applicable, and before any update
        // Do it after setting obj._update, in case it should be overriden
        if (customProps) {
            for (var prop in customProps) {
                if (customProps.hasOwnProperty(prop)) {
                    obj[prop] = customProps[prop];
                }
            }
        }

        obj._updateElement();  // update once everything is in place
        return obj;
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
