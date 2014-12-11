Sketchpad.js
============

**Sketchpad.js** is an open source JavaScript graphics library for **constructive vector drawing**. It provides an object model for common vector geometry under HTML5 Canvas graphics, while offering an intuitive constructive geometry API, and *dynamically maintaining the parent-children relations* for you.

Hello world
-----------

Let's start by creating a simple HTML scaffolding with some basic styling for a full-screen canvas element:

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



