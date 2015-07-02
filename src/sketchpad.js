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

    // Turn development mode on for extra-verbose console logs
    var DEV = true;


    //  ██████╗ ██████╗ ██████╗ ███████╗
    // ██╔════╝██╔═══██╗██╔══██╗██╔════╝
    // ██║     ██║   ██║██████╔╝█████╗  
    // ██║     ██║   ██║██╔══██╗██╔══╝  
    // ╚██████╗╚██████╔╝██║  ██║███████╗
    //  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
    
    // Versioning
    this.version = "v0.1.0";
    this.build = 1208;

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








    // ██████╗ ██████╗ ██╗██╗   ██╗ █████╗ ████████╗███████╗
    // ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗╚══██╔══╝██╔════╝
    // ██████╔╝██████╔╝██║██║   ██║███████║   ██║   █████╗  
    // ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║   ██║   ██╔══╝  
    // ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║   ██║   ███████╗
    // ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝   ╚═╝   ╚══════╝
    /**
     * A place for all private variables, objects and function closures
     */

    var S = this;                   // the context

    // Some constants
    var TAU = 2 * Math.PI,          // ;)
        TO_DEGS = 360 / TAU,
        TO_RADS = TAU / 360;

    /**
     * This controls whether if a 0.5px drawing translation is effective
     * to avoid aliading problems. 
     * Weird, but this effect has completely opposite effects on Chr and FF,
     * should implement browser recognition and discrimination?
     *
     * @ref http://stackoverflow.com/a/3279863/1934487
     * @type {Boolean}
     */
    var ANTIALIASING = true;

    /**
     * Proportional extension of object shape for dragging purposes.
     * Eg: a value of 1 limits the dragging area to strictly the shape, 
     * a value of 2 offsets this area to twice its boundary
     * @type {Number}
     */
    var DRAG_TOLERANCE = 1.3; 

    /**
     * How much bigger from its real size planes should render, 
     * without scaling strokes
     * @type {Number}
     */
    var PLANE_RENDER_FACTOR = 50; 

    // Incremental id assignment
    var index = 1;                  // zero is reserved

    // A generic constructor interface to create Sketchpad Objects with type, 
    // args and update function name
    var build = function(TYPE, parents, update, customProps) {
        var obj = new typeMap[TYPE]();                  // construct an object of this type
    
        obj._makeChildOfParents(parents);
        obj._update = typeMap[TYPE]._updates[update];   // choose which update function to bind

        // Add custom properties to object if applicable, and before any update.
        // Do it after setting obj._update, in case it should be overriden.
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

     // Checks if this object has only one wrapped parent
    var checkConstrainedParenthood = function(obj) {
        if (obj._parents.length == 1 && obj._parents[0]._type == 'xwrap') {
            obj._isConstrained = false;
            obj._wrappedSingleParent = true;
        }
    };  

    // Returns the argument wrapped inside a XWRAP object
    var wrap = function(value){
        return new XWrap(value);
    };


    /**
     * Returns an array with the _value prop of the 'parents' objs
     * for specified 'indexArray' (pattern matching)
     */
    var parentValuesSlice = function(parents, indexArray) {
        var arr = [];

        // If no index passed (singleton parents)
        if (typeof indexArray === 'undefined') {
            for (var len = parents.length, i = 0; i < len; i++) {
                arr.push(parents[i]._value);
            }

        // If array parents 
        } else {
            for (var len = parents.length, i = 0; i < len; i++) {
                arr.push( indexArray[i] === -1 ?   // is singleton?
                        parents[i]._value :
                        parents[i]._value[indexArray[i]]);
            }
        }

        return arr;
    };

    /**
     * A function that binds a set of characteristic-object spawning methods to 
     * a class' proto
     * @param  {Class} clazz
     * @param  {String} returnType 
     * @param  {Object} protos
     */
    var attachCharacteristicObjectsProtos = function(clazz, returnType, protos) {
        for (var prop in protos) {
            if (protos.hasOwnProperty(prop)) {
                // Immediately invoke the function to lock in the state of 'prop' on closure
                (function(thisProp) {
                    clazz.prototype[thisProp] = function() {  // @todo a programmatic function name could be added here to help debugging?
                        return typeof this._properties[thisProp] !== 'undefined' ?
                                this._properties[thisProp] :
                                this._register(thisProp, build(returnType, [this], protos[thisProp]));
                    }
                }(prop));
            }
        };
    };

    /**
     * Given a coreProperty name, it returns an update function that 
     * reads that value from its single parent
     * @param  {String} coreProperty
     * @return {Function}              
     */
    var singleParentCorePropertySpawner = function(coreProperty) {
        return function(p) {
            return p[0][coreProperty];
        }
    };

    /**
     * Given a class and an object with 'coreProperty: objectType' pairs, 
     * it binds methods to that prototype that return linked children objects
     * @param  {Class} clazz     
     * @param  {Object} coreProps 
     */
    var bindCorePropertiesSpawners = function(clazz, coreProps) {
        for (var prop in coreProps) {
            if (coreProps.hasOwnProperty(prop)) {
                (function(spawnProp) {
                    clazz.prototype[spawnProp] = function() {
                        return typeof this._properties[spawnProp] !== 'undefined' ?
                                this._properties[spawnProp] : 
                                this._register(spawnProp, build(coreProps[spawnProp], [this], 'fromValue', {
                                    '_update': singleParentCorePropertySpawner(spawnProp)
                                }));
                    }
                }(prop));
            }
        }
    };

































    // ██████╗  █████╗ ███████╗███████╗
    // ██╔══██╗██╔══██╗██╔════╝██╔════╝
    // ██████╔╝███████║███████╗█████╗  
    // ██╔══██╗██╔══██║╚════██║██╔══╝  
    // ██████╔╝██║  ██║███████║███████╗
    // ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝

    // Pseudo-private properties
    this._elements = [];            // all the Elements this skectch contains
    this._renderableElements = [];  // references to renderable Elements --> TODO: implement
    this._initialized = false;      // was this correctly initialized
    this._canvas;                   // the html canvas element this Sketchpad is attached to
    this._canvasId;                 // the id of _canvas
    this._ctx;                      // graphic context of the canvas
    this._parentNode;               // this canvas' parent node, used for width/height calculations
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
        //if (DEV) console.log("Rendering frame " + this._frameCount);
        
        // Clean the background
        this._ctx.globalAlpha = 1.00;
        this._ctx.fillStyle = "#ffffff";
        this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
        this._ctx.fillRect(0, 0, this._canvasWidth, this._canvasHeight);
        
        // Gross workaround to the 1px line aliasing problem: http://stackoverflow.com/a/3279863/1934487
        if (ANTIALIASING) this._ctx.translate(0.5, 0.5);

        // Render each element
        for (var i = 0; i < S._renderableElements.length; i++) {
            if (S._renderableElements[i]._visible) S._renderableElements[i]._render();
        }

        // Revert the translation
        if (ANTIALIASING) this._ctx.translate(-0.5, -0.5);  
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

    /**
     * Searches the context (usually the window object) for properties with 
     * the same name as this pad's elements, and assigns them names correspondingly
     */
    this.autoNames = function(context) {
        var ctx = context || window;
        this._elements.forEach(function(e) {
            if (!e._name) e._findName(ctx);
        });
    };

    /**
     * Sets the default render magnification factor for Planes
     * @param {Number} factor
     */
    this.setPlaneRenderFactor = function(factor) {
        PLANE_RENDER_FACTOR = size;
        return PLANE_RENDER_FACTOR;
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

        this._preUpdate = null;                     // a custom _preUdate function to be run once for special entities (e.g. .random())

        // Managing array-like xvars
        // @TODO: think if this should go to XBase (although geometry objects may also be array-like)
        this._isArray = false;                      // is the _value in this Element array-like?
        this._parentLengths = [];
        this._matchPatternType = 'longest-list';    // default behavior
        this._matchPattern = [];                    // an array with indices representing the match pattern



        /**
         * An identity update function to be overriden
         */
        this._update = function(parents) { };

        /**
         * Takes an array of objects, and adds them as parents of this object
         */
        this._makeChildOfParents = function(parents) {
            for (var l = parents.length, i = 0; i < l; i++) {
                var p = parents[i];
                // If parent is falsey (undefined, null) or if parent is not an XVAR, wrap it into one
                if (!p || !p._padObj) p = wrap(p);  
                this._parents.push(p);
                p._children.push(this);
            }

            // Do some default parent lengths and pattern matching
            var patt = [];
            for (var l = parents.length, i = 0; i < l; i++) {
                this._parentLengths.push(0);    // defaults to singletons, should be corrected on first update
                patt.push(-1);                  // -1 is used to flag singleton elements
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

        /**
         * Resets parent objects from this object, and removes this child 
         * from parents. Performs search on parents based on own _id
         * @return {Boolean} 
         */
        this._makeOrphan = function() {
            // Remove this from parents' children
            for (var i = 0; i < this._parents.length; i++) {
                var rem = false;
                for (var j = 0; j < this._parents[i]._children.length; j++) {
                    if (this._parents[i]._children[j]._id == this._id) {
                        this._parents[i]._children.splice(j, 1);
                        rem = true;
                        break;
                    }
                }
                if (!rem) {
                    if (DEV) console.log("Couldn't find this object in parents' children, something went wrong, element #" + i);
                    return false;
                }
            }
            this._parents = [];
            return true;
        };

        /**
         * Calls updateElement and updateChildren on all object's children
         */
        this._updateChildren = function() {
            this._children.forEach(function(elem) {
                // if (DEV) console.log('DEBUG: updating "' + elem._name + '", id#' + elem._id);
                elem._updateElement();
                elem._updateChildren();
            });
        };

        /**
         * A function that encompasses all update actions for this object
         */
        this._updateElement = function() {
            // Check if a _preUpdate funtion was registered, and run it
            if (this._preUpdate) this._preUpdate();
        };

        /**
         * Searches for this element in the context (usually the window object) 
         * and retrieves its property as object name.
         * @return {boolean} Returns the name if found an instance of this object, false otherwise
         */
        this._findName = function(context) {
            for (var a in context) {
                if (context.hasOwnProperty(a) && context[a] == this) {  // deprecation warning ?!
                    this._name = a;
                    return a;
                }
            }
            return false;
        };
    };



















    // ██████╗ ███████╗███╗   ██╗██████╗ ███████╗██████╗  █████╗ ██████╗ ██╗     ███████╗
    // ██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔══██╗██║     ██╔════╝
    // ██████╔╝█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝███████║██████╔╝██║     █████╗  
    // ██╔══██╗██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗██╔══██║██╔══██╗██║     ██╔══╝  
    // ██║  ██║███████╗██║ ╚████║██████╔╝███████╗██║  ██║██║  ██║██████╔╝███████╗███████╗
    // ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝

    /**
     * A subclass representing all Elements that have a visual renderable component
     */
    var Renderable = function() {
        // calls super
        Element.call(this);
        
        // Renderable properties
        this._renderable = true;
        this._visible = true;
        this._type = "renderable";

        S._renderableElements.push(this);   // store a reference to this object in the renderable collection. @TODO: maintain? Deleting an object would have to look for it in _elements and _renderable... too
    };
    Renderable.prototype = Object.create(Element.prototype);
    Renderable.prototype.constructor = Renderable;

    Renderable.prototype.setVisible = function(isVisible) {
        this._visible = isVisible;
        return this._visible;
    };




    //  ██████╗ ███████╗ ██████╗ ███╗   ███╗███████╗████████╗██████╗ ██╗   ██╗
    // ██╔════╝ ██╔════╝██╔═══██╗████╗ ████║██╔════╝╚══██╔══╝██╔══██╗╚██╗ ██╔╝
    // ██║  ███╗█████╗  ██║   ██║██╔████╔██║█████╗     ██║   ██████╔╝ ╚████╔╝ 
    // ██║   ██║██╔══╝  ██║   ██║██║╚██╔╝██║██╔══╝     ██║   ██╔══██╗  ╚██╔╝  
    // ╚██████╔╝███████╗╚██████╔╝██║ ╚═╝ ██║███████╗   ██║   ██║  ██║   ██║   
    //  ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   

    /**
     * A middleware class for geometry-like renderable element.
     * This may exclude things such as text-tags, images or whatever.
     */
    var Geometry = function() {
        Renderable.call(this);

        this._type = "geometry";
        this._value = {};               // a _value object storing all core properties

        /**
         * A function that encompasses all update actions for this object
         * @override Element._updateElement
         */
        this._updateElement = function() {

            // (here we would have parent array checks and deep changes) 

            // Check if a _preUpdate funtion was registered, and run it
            if (this._preUpdate) this._preUpdate();

            // (here we would do matching pattern updates)

            // var slice = this._parentSlice();
            var slice = parentValuesSlice(this._parents);
            this._value = this._update(slice, 0);
        }

    };
    Geometry.prototype = Object.create(Renderable.prototype);
    Geometry.prototype.constructor = Geometry;









    // ██╗   ██╗███████╗ ██████╗████████╗ ██████╗ ██████╗ 
    // ██║   ██║██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗
    // ██║   ██║█████╗  ██║        ██║   ██║   ██║██████╔╝
    // ╚██╗ ██╔╝██╔══╝  ██║        ██║   ██║   ██║██╔══██╗
    //  ╚████╔╝ ███████╗╚██████╗   ██║   ╚██████╔╝██║  ██║
    //   ╚═══╝  ╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
    var Vector = function(x, y) {
        Geometry.call(this);

        this._type = 'vector';
        // this._visible = false;

        this._value = {
            x: x, 
            y: y
        };

        // Some values for rendering purposes
        this._renderValues = {
            x: 0, 
            y: 0
        };
    };
    Vector.prototype = Object.create(Geometry.prototype);
    Vector.prototype.constructor = Vector;        

    Vector.coreProperties = {
        'x' : 'xvar',
        'y' : 'xvar'
    };
    bindCorePropertiesSpawners(Vector, Vector.coreProperties);

    Vector.prototype._render = function() {
        S._ctx.strokeStyle = 'red';
        S._ctx.lineWidth = 1;
        S._ctx.beginPath();
        S._ctx.arc(this._renderValues.x + this._value.x, this._renderValues.y + this._value.y, 1, 0, TAU);
        S._ctx.moveTo(this._renderValues.x, this._renderValues.y);
        S._ctx.lineTo(this._renderValues.x + this._value.x, this._renderValues.y + this._value.y);
        S._ctx.stroke();
        S._ctx.closePath();
    };

    Vector.prototype.normalize = 
    Vector.prototype.unitize = function() {
        return build('vector', [this], 'normalizedVectorFromVector');
    };

    Vector.prototype.setRenderPosition = function(x, y) {
        this._renderValues = {
            x: x, 
            y: y
        };
    };

    /**
     * Update functions
     * @type {Object}
     */
    Vector._updates = {
        vectorFromCoordinates: function(p) {
            return {
                x: p[0],
                y: p[1]
            };
        },

        vectorFromPointPoint: function(p) {
            return {
                x: p[1].x - p[0].x,
                y: p[1].y - p[0].y
            }
        },

        normalizedVectorFromVector: function(p) {
            var len = util.vectorLength(p[0]);
            return {
                x: p[0].x / len,
                y: p[0].y / len
            }
        }
    };

    //////////////////////
    // PUBLIC FACTORIES //
    //////////////////////
    this.vector = function(x, y) {
        var a = arguments, len = a.length;

        if (len == 2) {
            return build('vector', arguments, 'vectorFromCoordinates');
        }

        console.error('Sketchpad: invalid arguments for Sketchpad.vector');
        return undefined;
    };

    this.vector.twoPoints = function(startPoint, endPoint) {
        var a = arguments, len = a.length;

        if (len == 2) {
            return build('vector', arguments, 'vectorFromPointPoint');
        }

        console.error('Sketchpad: invalid arguments for Sketchpad.vector.twoPoints');
        return undefined;
    };



    // ██████╗  ██████╗ ██╗███╗   ██╗████████╗
    // ██╔══██╗██╔═══██╗██║████╗  ██║╚══██╔══╝
    // ██████╔╝██║   ██║██║██╔██╗ ██║   ██║   
    // ██╔═══╝ ██║   ██║██║██║╚██╗██║   ██║   
    // ██║     ╚██████╔╝██║██║ ╚████║   ██║   
    // ╚═╝      ╚═════╝ ╚═╝╚═╝  ╚═══╝   ╚═╝   

    var Point = function(x, y) {
        Geometry.call(this);

        this._type = 'point';
        // this._visible = false;

        // Core properties
        this._value = {
            x: x,
            y: y
        };

        this._radius = 1;
    };
    Point.prototype = Object.create(Geometry.prototype);
    Point.prototype.constructor = Point;

    Point.coreProperties = {
        'x' : 'xvar',
        'y' : 'xvar'
    };
    bindCorePropertiesSpawners(Point, Point.coreProperties);

    Point.prototype._render = function() {
        S._ctx.strokeStyle = 'black';
        S._ctx.lineWidth = 1;
        S._ctx.fillStyle = 'white';
        S._ctx.beginPath();
        S._ctx.arc(this._value.x, this._value.y, this._radius, 0, TAU);
        S._ctx.stroke();
        S._ctx.fill();
        S._ctx.closePath();
    };

    /**
     * Sets the (x, y) coordinates of the Point
     * @TODO  Check if Point is constrained by parents
     */
    Point.prototype.setPosition = function(x, y) {
        this._value.x = x;
        this._value.y = y;
        this._updateChildren();
    };

    // Point.prototype.transform = function(plane) {

    // };

    /**
     * Update functions
     * @type {Object}
     */
    Point._updates = {

        pointFromCoordinates: function(p) {
            return {
                x: p[0],
                y: p[1]
            };
        },

        pointFromPointAndPlane: function(p) {

        },

        centerPointOfLine: function(p) {
            return {
                x: p[0].x0 + 0.5 * (p[0].x1 - p[0].x0),
                y: p[0].y0 + 0.5 * (p[0].y1 - p[0].y0)
            };
        },

        startPointOfLine: function(p) {
            return {
                x: p[0].x0,
                y: p[0].y0
            };
        },

        endPointOfLine: function(p) {
            return {
                x: p[0].x1,
                y: p[0].y1
            };
        }

    };

    //////////////////////
    // PUBLIC FACTORIES //
    //////////////////////

    this.point = function(x, y) {
        var a = arguments, len = a.length;

        if (len == 2) {
            // if (DEV) console.log('DEBUG: creating point');
            return build('point', arguments, 'pointFromCoordinates');
        }

        console.error('Sketchpad: invalid arguments for Sketchpad.point');
        return undefined;
    };  




    // ███╗   ██╗ ██████╗ ██████╗ ███████╗
    // ████╗  ██║██╔═══██╗██╔══██╗██╔════╝
    // ██╔██╗ ██║██║   ██║██║  ██║█████╗  
    // ██║╚██╗██║██║   ██║██║  ██║██╔══╝  
    // ██║ ╚████║╚██████╔╝██████╔╝███████╗
    // ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝
    /**
     * Base Node class, represents a Point object that can be dragged under its free constrains
     */
    var Node = function(x, y) {
        Point.call(this, x, y);

        this._type = 'node';
        this._visible = true;
        this._radius = 4;
    };
    Node.prototype = Object.create(Point.prototype);
    Node.prototype.constructor = Node;

    Node.coreProperties = {
        'x' : 'xvar',
        'y' : 'xvar'
    };
    bindCorePropertiesSpawners(Node, Node.coreProperties);

    Node.prototype._render = function() {
        S._ctx.strokeStyle = 'black';
        S._ctx.lineWidth = 1.5;
        S._ctx.fillStyle = 'white';
        S._ctx.beginPath();
        S._ctx.arc(this._value.x, this._value.y, this._radius, 0, TAU);
        S._ctx.stroke();
        S._ctx.fill();
        S._ctx.closePath();
    };

    /**
     * Update functions
     * @type {Object}
     */
    Node._updates = {
        nodeFromCoordinates: function(p) {
            return {
                x: p[0],
                y: p[1]
            };
        }
    }

    ///////////////////////
    // PUBLIC FACTORIES  //
    ///////////////////////

    this.node = function(x, y) {
        var a = arguments, len = a.length;

        if (len == 2) return build('node', arguments, 'nodeFromCoordinates');

        console.error('Sketchpad: invalid arguments for Sketchpad.node');
        return undefined;
    };













    // ██╗     ██╗███╗   ██╗███████╗
    // ██║     ██║████╗  ██║██╔════╝
    // ██║     ██║██╔██╗ ██║█████╗  
    // ██║     ██║██║╚██╗██║██╔══╝  
    // ███████╗██║██║ ╚████║███████╗
    // ╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝

    var Line = function(x0, y0, x1, y1) {
        Geometry.call(this);

        this._type = 'line';

        // Core properties
        this._value = {
            x0: x0,
            y0: y0,
            x1: x1,
            y1: y1
        };
    };
    Line.prototype = Object.create(Geometry.prototype);
    Line.prototype.constructor = Line;

    Line.coreProperties = {
        'x0' : 'xvar',
        'y0' : 'xvar',
        'x1' : 'xvar',
        'y1' : 'xvar'
    };
    bindCorePropertiesSpawners(Line, Line.coreProperties);

    Line.prototype._render = function() {
        S._ctx.strokeStyle = 'black';
        S._ctx.lineWidth = 1;
        S._ctx.beginPath();
        S._ctx.moveTo(this._value.x0, this._value.y0);
        S._ctx.lineTo(this._value.x1, this._value.y1);
        S._ctx.stroke();
        S._ctx.closePath();
    };

    /**
     * Attach a set of simple characteristic-object-generation 
     * methods to the proto. 
     */
    var lineProtos = {
        'center'    : 'centerPointOfLine',
        'start'     : 'startPointOfLine',
        'end'       : 'endPointOfLine'
    };
    attachCharacteristicObjectsProtos(Line, 'point', lineProtos);

    /**
     * Update functions
     * @type {Object}
     */
    Line._updates = {

        lineFromCoordinates: function(p) {
            return {
                x0: p[0],
                y0: p[1],
                x1: p[2],
                y1: p[3]
            }
        },

        lineFromPointPoint: function(p) {
            return {
                x0: p[0].x,
                y0: p[0].y,
                x1: p[1].x,
                y1: p[1].y
            }
        }
    };


    //////////////////////
    // PUBLIC FACTORIES //
    //////////////////////

    this.line = function() {
        var a = arguments, len = a.length;

        switch (len) {
            case 2:
                return build('line', a, 'lineFromPointPoint');
                break;

            case 4:
                return build('line', a, 'lineFromCoordinates');
                break;
        }

        console.error('Sketchpad: invalid arguments for Sketchpad.line');
        return undefined;
    };














    // ██████╗ ██╗      █████╗ ███╗   ██╗███████╗
    // ██╔══██╗██║     ██╔══██╗████╗  ██║██╔════╝
    // ██████╔╝██║     ███████║██╔██╗ ██║█████╗  
    // ██╔═══╝ ██║     ██╔══██║██║╚██╗██║██╔══╝  
    // ██║     ███████╗██║  ██║██║ ╚████║███████╗
    // ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝
                                              
    var Plane = function(centerPoint, xAxis) {
        Geometry.call(this);

        this._type = 'plane';

        // Core properties
        this._value = {
            center: centerPoint,
            x: xAxis
        };

    };
    Plane.prototype = Object.create(Geometry.prototype);
    Plane.prototype.constructor = Plane;

    // Plane.coreProperties = {
    //     'center' : 'point',
    //     'x' : 'vector'
    // };
    Plane.coreProperties = {
        'x' : 'xvar',
        'y' : 'xvar',
        'rotation' : 'xvar',
        'scale' : 'xvar'
    }
    bindCorePropertiesSpawners(Plane, Plane.coreProperties);

    Plane.prototype._render = function() {
        S._ctx.strokeStyle = 'blue';
        S._ctx.lineWidth = 1;

        S._ctx.save();
        S._ctx.translate(this._value.x, this._value.y);
        S._ctx.rotate(this._value.rotation);
        S._ctx.scale(this._value.scale, this._value.scale);  // should stroke scaling be avoided?

        S._ctx.beginPath();
        S._ctx.moveTo(0, 0);
        S._ctx.lineTo(PLANE_RENDER_FACTOR, 0);
        // S._ctx.lineTo(this._value.scale, 0);
        S._ctx.stroke();
        S._ctx.closePath();
        
        S._ctx.lineWidth = 0.5;
        S._ctx.strokeRect(-PLANE_RENDER_FACTOR, -PLANE_RENDER_FACTOR, 
                2 * PLANE_RENDER_FACTOR, 2 * PLANE_RENDER_FACTOR);
        // S._ctx.strokeRect(-this._value.scale, -this._value.scale, 2 * this._value.scale, 2 * this._value.scale);
        S._ctx.restore();
    };

    /**
     * Update functions
     * @type {Object}
     */
    Plane._updates = {

        planeFromPointVector: function(p) {
            return {
                // center: p[0],
                // x: p[1]
                x: p[0].x,
                y: p[0].y,
                rotation: Math.atan2(p[1].y, p[1].x),
                scale: Math.sqrt(p[1].x * p[1].x + p[1].y * p[1].y)
            }
        }

    };

    //////////////////////
    // PUBLIC FACTORIES //
    //////////////////////

    this.plane = function(center, xAxis) {
        if (arguments.length != 2) {
            console.error('Sketchpad: invalid arguments for Sketchpad.plane');
            return undefined;
        };

        return build('plane', arguments, 'planeFromPointVector')
    };


























































    // ██╗  ██╗██████╗  █████╗ ███████╗███████╗
    // ╚██╗██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝
    //  ╚███╔╝ ██████╔╝███████║███████╗█████╗  
    //  ██╔██╗ ██╔══██╗██╔══██║╚════██║██╔══╝  
    // ██╔╝ ██╗██████╔╝██║  ██║███████║███████╗
    // ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝

    /**
     * A base class for XVar and XWrap objects to inherit from
     * Contains the _value property, and the .value gsetters 
     * @param {Object} value 
     */
    var XBase = function(value) {
        Element.call(this);
        this._value = value;
        this._type = 'xbase';

        /**
         * Returns an array with the _value prop of the _parents objs
         * for specified indexArray (pattern matching)
         * @todo  Could this become a private function? var valueSlice = function(parents, indexArray) {...}
         */
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

        /**
         * A function that encompasses all update actions for this object
         * @override
         * @param  {boolean} forceDeep Update even if parents haven't changed
         */
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

            // Check if a _preUpdate funtion was registered, and run it
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
        
    };
    XBase.prototype = Object.create(Element.prototype);
    XBase.prototype.constructor = XBase;

    // This has better performance than Object.defineProperties(): http://jsperf.com/getter-setter/7
    XBase.prototype = {
        get value() {
            return this._value;
        },
        get val() {
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
        },
        set val(x) {
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

        /**
         * Flags this._isArray
         * @return {Boolean}
         */
        this._checkArrayness = function() {
            this._isArray = Array.isArray ? 
                Array.isArray(this._value) :                       // first try ECMAScript 5 native
                toString.call(this._value) === '[object Array]';   // else compare array string
            return this._isArray;
        };

    };
    XWrap.prototype = Object.create(XBase.prototype);
    XWrap.prototype.constructor = XWrap;




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

        /**
         * Flags this._isArray
         * @return {Boolean}  this._isArray
         */
        this._checkArrayness = function() {
            this._isArray = false;

            for (var l = this._parentLengths.length, i = 0; i < l; i++) {
                if (this._parentLengths[i]) {  // if any parent's length != 0
                    this._isArray = true;
                    break;
                }
            }

            return this._isArray;
        };

    };
    XVar.prototype = Object.create(XBase.prototype);
    XVar.prototype.constructor = XVar;

    XVar._updates = {

        fromValue: function(p) {
            return p[0];  // retrieve from xvar/xwrapped parent
        },


        ///////////////////////
        // CASTING FUNCTIONS //
        ///////////////////////

        boolean: function(p) {
            return Boolean(p[0]);
        },

        number: function(p) {
            return Number(p[0]);
        },

        string: function(p) {
            return String(p[0]);
        },

        array: function(p) {
            return [p[0]];
        },

        ////////////////////
        // BOOLEAN LOGIC  //
        ////////////////////

        not: function(p) {
            return !p[0];
        },

        and: function(p) {
            for (var i = 0; i < p.length; i++) {
                if (!p[i]) return false;
            }
            return true;
        },

        or: function(p) {
            for (var i = 0; i < p.length; i++) {
                if (p[i]) return true;
            }
            return false;
        },

        equal: function(p) {
            for (var l = p.length - 1, i = 0; i < l; i++) {
                if (p[i] != p[i + 1]) return false;
            }
            return true;
        },

        notEqual: function(p) {
            for (var l = p.length, i = 0; i < l - 1; i++) {  // pyramidal comparison without self-check 
                for (var j = i + 1; j < l; j++) {
                    if (p[i] == p[j]) return false;
                }
            }
            return true;
        },

        greater: function(p) {
            return p[0] > p[1];
        },

        greaterEqual: function(p) {
            return p[0] >= p[1];
        },

        less: function(p) {
            return p[0] < p[1];
        },

        lessEqual: function(p) {
            return p[0] <= p[1];
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

        abs: function(p) {
            return Math.abs(p[0]);
        },

        sqrt: function(p) {
            return Math.sqrt(p[0]);
        },

        sin: function(p) {
            return Math.sin(p[0]);
        },

        cos: function(p) {
            return Math.cos(p[0]);
        },

        tan: function(p) {
            return Math.tan(p[0]);
        },

        round: function(p) {
            return Math.round(p[0]);
        },

        floor: function(p) {
            return Math.floor(p[0]);
        },

        ceil: function(p) {
            return Math.ceil(p[0]);
        },

        toDegrees: function(p) {
            return TO_DEGS * p[0];
        },

        toRadians: function(p) {
            return TO_RADS * p[0];
        },

        add: function(p) {
            var sum = p[0];  // also sets initial type
            for (var i = 1; i < p.length; i++) {
                sum += p[i];
            }
            return sum;
        },

        subtract: function(p) {
            return p[0] - p[1];
        },

        multiply: function(p) {
            var mul = p[0];
            for (var l = p.length, i = 1; i < l; i++) {
                mul *= p[i];
            }
            return mul;
        },

        divide: function(p) {
            return p[0] / p[1];
        },

        modulo: function(p) {
            return p[0] % p[1];
        },

        pow: function(p) {
            return Math.pow(p[0], p[1]);
        },

        atan2: function(p) {
            return Math.atan2(p[0], p[1]);  // inputs were in the form (Y, X)
        },

        random: function(p, i) {
            // Updates the value without changing the random parameter. See 'randomNext'.
            return this._randomSeeds[i] * (p[1] - p[0]) + p[0];
        },


        /////////////////////
        // ARRAY FUNCTIONS //
        /////////////////////

        // @TODO: what if 'count' is a float?
        series: function(p) {
            var ser = [];
            for (var i = 0; i < p[0]; i++) {  // inputs in the form (count, start, step)
                ser.push(p[1] + i * p[2]);
            }  
            return ser;
        },

        // @TODO: what if 'count' is a float?
        range: function(p) {
            var rang = [],
                step = (p[2] - p[1]) / p[0];
            for (var i = p[1]; i <= p[2]; i += step) {  // inputs in the form (count, start, end)
                rang.push(i);
            }  
            return rang;
        },

        //////////////////////
        // STRING FUNCTIONS //
        //////////////////////

        // returns the length of parent string (or array, if parent is array of arrays)
        // should have no default, and return undefined if not eligible? This would be 'truer' to JS...
        length: function(p) {
            return typeof p[0].length !== 'undefined' ? p[0].length : 1; 
        },

        toLowerCase: function(p) {
            // Parent may not be a string
            return p[0].toLowerCase ? p[0].toLowerCase() : p[0];
        },

        toUpperCase: function(p) {
            // Parent may not be a string
            return p[0].toUpperCase ? p[0].toUpperCase() : p[0];
        },

        slice: function(p) {
            return typeof p[0].slice !== 'undefined' ?
                    p[0].slice(p[1], p[2]) : 
                    p[0];
        },

        charAt: function(p) {
            return typeof p[0].charAt !== 'undefined' ? 
                    p[0].charAt(p[1]) : 
                    p[0];
        },

        replace: function(p) {
            return typeof p[0].replace !== 'undefined' ? 
                    p[0].replace(p[1], p[2]) : 
                    p[0];
        },

        concat: function(p) {
            var sum = String(p[0]);
            for (var i = 1; i < p.length; i++) {
                sum += p[i];
            }
            return sum;
        },


        ////////////////////
        // MISC FUNCTIONS //
        ////////////////////

        // A dummy update, will in fact be overriden by the custom callback
        compose: function(p) {
            return p[0];
        },


        /////////////////////////////////
        // CHARACTERISTIC PROPS (TEMP) //
        /////////////////////////////////

        xvarXProperty: function(p) {
            return p[0].x;
        },

        xvarYProperty: function(p) {
            return p[0].y;
        }

    };

    //////////////////////////////////////////////////
    // AUTO GENERATION OF CHARACTERISTIC PROTOTYPES //
    // (this are all argument-less)                 //
    //////////////////////////////////////////////////
    var XVarProtos = [
        'not',
        'half',
        'double',
        'abs',
        'sqrt',
        'sin',
        'cos',
        'tan',
        'round',
        'floor',
        'ceil',
        'toDegrees',
        'toRadians',
        'length',
        'toLowerCase',
        'toUpperCase'
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









































    // ██████╗ ██████╗ ██╗██╗   ██╗ █████╗ ████████╗███████╗
    // ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗╚══██╔══╝██╔════╝
    // ██████╔╝██████╔╝██║██║   ██║███████║   ██║   █████╗  
    // ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║   ██║   ██╔══╝  
    // ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║   ██║   ███████╗
    // ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝   ╚═╝   ╚══════╝
    /**
     * A place for all private variables, objects and function closures
     * All the way at the end, some of this variables refer to entities
     * that were defined previously
     */

    // An object mapping Object types to private constructors
    var typeMap = {
        'element'   : Element,
        'geometry'  : Geometry,
        'vector'    : Vector,
        'point'     : Point,
        'node'      : Node,
        'line'      : Line,
        'plane'     : Plane,
        'xbase'     : XBase,
        'xwrap'     : XWrap,
        'xvar'      : XVar
    };









    // ██╗   ██╗████████╗██╗██╗     
    // ██║   ██║╚══██╔══╝██║██║     
    // ██║   ██║   ██║   ██║██║     
    // ██║   ██║   ██║   ██║██║     
    // ╚██████╔╝   ██║   ██║███████╗
     // ╚═════╝    ╚═╝   ╚═╝╚══════╝

    /**
     * A private library with self-contained utility functions
     * @type {Object}
     */
    var util = {

        vectorLength: function(vectorProps) {
            return Math.sqrt(vectorProps.x * vectorProps.x 
                    + vectorProps.y * vectorProps.y);
        }

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
        this._ctx = this._canvas.getContext('2d');
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
        //return undefined;
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

        /**
         * Calculate twice the distance to the Node, useful for comparisons to avoid sqrting
         */
        dist2ToNode: function (x, y, node) {
            return (node._value.x - x) * (node._value.x - x) + (node._value.y - y) * (node._value.y - y);
        },

        searchNodeToDrag: function (x, y) {
            for (var i = S._elements.length - 1; i > -1; i--) {  // loop backwards to favour most recent elements
                var elem = S._elements[i];
                if (elem._type != 'node') continue;
                if (this.dist2ToNode(x, y, elem) < DRAG_TOLERANCE * elem._radius * elem._radius ) {
                    // if (DEV) console.log("DEBUG: Dragging node id #" + elem._id);
                    return elem;
                }
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
                // S.mouse.dragObject.updateChildren();  // this is part of _updateChildren
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
