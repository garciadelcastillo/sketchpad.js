Sketchpad.js
============

**Sketchpad.js** is an open source JavaScript graphics library for **constructive vector drawing**. It provides an object model for common vector geometry under HTML5 Canvas graphics, while offering an intuitive constructive geometry API and **dynamically maintaining parent-children relations** for you.

Basic setup
-----------

Let's start by creating a simple HTML scaffolding with some basic styling for a full-screen canvas element. You can find the latest stable version in the [project's dist folder](https://github.com/garciadelcastillo/sketchpad.js/tree/master/dist). Sketchpad currently depends on [jQuery](http://jquery.com/) for DOM manipulation, so make sure to reference it as well.

```html
<!DOCTYPE html>
<meta charset="utf-8">
<html>
  <head>
  </head>
  <style>
    body {
      margin: 0;
      padding: 0;
    }

    #sketchpadDiv {
      position: absolute; 
      width: 100%; 
      height: 100%;
    }

    #sketchpadCanvas {
      position: absolute;
    }

  </style>
  <body>
    <div id="sketchpadDiv">
      <canvas id="sketchpadCanvas"></canvas>       
    </div>
  </body>
  <script type="text/javascript" src="jquery-2.1.1.min.js"></script>
  <script type="text/javascript" src="sketchpad.js"></script>
  <script>

    // Sketchpad code goes here

  </script>
</html>
```

Hello world
-----------

We are now ready for some action. First, create a new instance of a Sketchpad, passing the id of the canvas element:

```html
var sp = new Sketchpad('sketchpadCanvas');
```

Now, create two Nodes at custom XY coordinates. Think of Nodes just as Points that have some degree of freedom, and that you can drag and move around.

```html
var A = new sp.Point(100, 100),
    B = new sp.Point(300, 100);
```

Create a new Line between them by using the static method Line.between(Point, Point):

```html
var AB = sp.Line.between(A, B);
```

Optionally, add Tags to each element with their var name:

```html
sp.tagElementNames();
```

That's it! Now you can move the Nodes around, and Sketchpad will take care of updating the Line and Tags accordingly!

```html
<script>
var sp = new Sketchpad('sketchpadCanvas');   // instantiate a new Sketchpad on the canvas

var A = new sp.Point(100, 100),              // create two free draggable Nodes
    B = new sp.Point(300, 100);

var AB = sp.Line.between(A, B);              // construct a Line between the Nodes

sp.tagElementNames();                        // add variable name Tags to all elements
</script>
```
![Line between two Nodes](http://www.garciadelcastillo.es/sketchpad/linenodes.gif "Line between two Nodes")


Examples
--------



Documentation
-------------


License
-------
See [license](https://github.com/garciadelcastillo/sketchpad.js/tree/master/LICENSE.md)