Sketchpad.js
============

**Sketchpad.js** is an open source JavaScript graphics library for **constructive vector drawing**. It provides an object model for common vector graphics under HTML5 Canvas, while offering an intuitive constructive geometry API and **dynamically maintaining parent-children relations** for you.

Basic Setup
-----------

Let's start by creating a simple HTML scaffolding with some basic styling for a full-page canvas element. You can find the latest stable version of Sketchpad.js in the [project's dist folder](https://github.com/garciadelcastillo/sketchpad.js/tree/master/dist). Sketchpad currently depends on [jQuery](http://jquery.com/) for DOM manipulation, so make sure to reference it as well.

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

Hello World
-----------

We are now ready for some action. First, create a new instance of a Sketchpad, passing the id of the canvas element:

```javascript
var pad = new Sketchpad('sketchpadCanvas');
```

Now, create two Nodes at custom XY coordinates. Think of Nodes just as Points that have some degree of freedom, and that you can drag and move around.

```javascript
var A = new pad.Node(100, 100),
    B = new pad.Node(300, 100);
```

Create a new Line between them by using the static method Line.between(Point, Point):

```javascript
var AB = pad.Line.between(A, B);
```

That's it! Now you can move the Nodes around, and Sketchpad will take care of updating the Line and Tags accordingly!

```javascript
var pad = new Sketchpad('sketchpadCanvas');   // instantiate a new Sketchpad on canvas

var A = new pad.Node(100, 100),               // create two free draggable Nodes
    B = new pad.Node(300, 100);

var AB = pad.Line.between(A, B);              // construct a Line between the Nodes

pad.tagElementNames();                        // add variable name Tags to all elements
```
![Line between two Nodes](https://github.com/garciadelcastillo/sketchpad.js/blob/master/docs/readme/linenodes.gif "Line between two Nodes")


Examples & Documentation
------------------------

Like what you see? This is just the beginning.

Check out the [annotated walkthrough](https://github.com/garciadelcastillo/sketchpad.js/wiki/Walkthrough) for Sketchpad's main features. Also, don't forget to check the list of [examples](https://github.com/garciadelcastillo/sketchpad.js/wiki/Examples) and play around with them.

A very handy **cheatsheet** can be found in the [docs folder](https://github.com/garciadelcastillo/sketchpad.js/tree/master/docs). And of course, you can always check the documentation for the full list of features.

Acknowledgments
---------------

Thanks to [Prof. Panagiotis Michalatos](http://sawapan.eu) for his guidance and contribution to this project.

Sketchpad.js is a rendition to [Prof. Ivan Sutherland's PhD Thesis](https://www.youtube.com/watch?v=495nCzxM9PI).

License
-------
See [license](https://github.com/garciadelcastillo/sketchpad.js/tree/master/LICENSE.md).
