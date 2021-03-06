Sketchpad.js cheatsheet
=======================

///////////////////////
SKETCHPAD
  CONSTRUCTORS
    new Sketchpad(canvasId)

  METHODS
    update()
    visible()
    invisible()
    currentStyle(style)
    findElementNames()

  PUBLIC PROPERTIES
    width {Measure}
    height {Measure}


///////////////////////
ELEMENT
  CONSTRUCTORS
    (none)

  METHODS (most of these are internal, avoid using them!)  --> apply underscore prefixes?
    Element.addParents(element0, element1...)
    // Element.addChild(element)  @deprecated
    Element.isChildOf(element0, element1...)
    Element.updateChildren()
    Element.checkStates()
    Element.setVisible(boolean)
    Element.setStyle(style)
    Element.findName()


///////////////////////
POINT
  CONSTRUCTORS
    new Point(number, number)
    // Point.fromMeasures(measure, measure)  // TEMP, to merge into base constructor
    Point.along(line, number)
    Point.along(circle, number)
    Point.along(line, measure)
    Point.along(circle, measure)
    Point.along(line, numericSet)
    Point.along(circle, numericSet)
    Point.projection(point, line)
    Point.projection(point, circle)
    Point.intersection(line, line)
    Point.intersection(line, circle)  // and viceversa (must fix drawing order)
    Point.intersection(circle, circle)
    Point.offset(point, number/measure, numer/measure)
    Point.offsetPolar(point, number/measure, number/measure)

  METHODS
    Point.setPosition(number, number)
    Point.move(number, number)


///////////////////////
NODE
  CONSTRUCTORS
    new Node(number, number)
    Node.along(line, number)
    Node.along(circle, number)
    Node.horizontal(number, number)
    Node.horizontal(number, measure)
    Node.vertical(number, number)
    Node.vertical(measure, number)

  METHODS
    (none)


///////////////////////
LINE
  CONSTRUCTORS
    new Line(number, number, number, number)  // xy0, xy1
    Line.between(point, point)
    Line.between(point, pointSet)  // TODO: add viceversa
    Line.between(pointSet, pointSet)
    Line.polar(point, number, number)  // startPoint, length, angle
    Line.polar(point, measure, number)
    Line.polar(point, number, measure)
    Line.polar(point, measure, measure)

  METHODS
    (none)


///////////////////////
CIRCLE
  CONSTRUCTORS
    new Circle(number, number, number)  // x, y, radius
    Circle.centerRadius(point, number)
    Circle.centerRadius(point, measure)

  METHODS
    Circle.setRadius(number)


///////////////////////
MEASURE
  CONSTRUCTORS
    Measure.distance(point, point)
    Measure.angle(point, point, point)
    Measure.compose(object, [object...], function)

  METHODS
    (none)


///////////////////////
SET
  CONSTRUCTORS  
    Set.range(number, number, number)  // start, end, steps
    Set.sequence(number, number, number)  // start, stepSize, count
    Set.random(number, number, number)  // start, end, count
    
  METHODS
    Set.setItems(JSArray, number)  // objects, subtype as pad.C.FOO constant


///////////////////////
STYLE
  CONSTRUCTORS  
    new Style({
      stroke: '',
      strokeWidth: '',
      fill: '',
      fontFamily: '',
      fontSize: '',
      fontStyle: '',
      fontCSS: '',
      textFill: '',
      textVAlign: '',
      textHAlign: '',
      textOffsetX: 0,
      textOffsetY: 0
    })

  METHODS
    Style.applyTo(element0, element1...)

///////////////////////
TAG
  CONSTRUCTORS  
    new Text(string, number, number)  // text, xpos, ypos
    Text.on(point, [text])

  METHODS
    (none)


///////////////////////
LABEL
  CONSTRUCTORS  
    new Label(string)  // text
    Label.compose(object, [object...], function)
    Label.from(object)

  METHODS
    (none)