Sketchpad.js cheatsheet
=======================

///////////////////////
ELEMENT
  CONSTRUCTORS
    (none)

  METHODS (most of these are internal, avoid using them!)  --> apply underscore prefixes?
    Element.addParent(element0, element1...)
    // Element.addChild(element)  @deprecated
    Element.isChildOf(element0, element1...)
    Element.updateChildren()
    Element.checkStates()
    Element.setVisible(boolean)
    Element.setStyle(style)


///////////////////////
POINT
  CONSTRUCTORS
    new Point(number, number)
    Point.along(line, number)
    Point.along(circle, number)
    Point.along(line, measure)
    Point.along(circle, measure)
    Point.along(line, numericSet)
    Point.along(circle, numericSet)
    Point.projection(point, line)
    Point.projection(point, circle)
    Point.intersection(line, line)
    Point.intersection(line, circle)  // and viceversa
    Point.intersection(circle, circle)

  METHODS
    Point.setPosition(number, number)
    Point.move(number, number)


///////////////////////
LINE
  CONSTRUCTORS
    new Line(number, number, number, number)  // xy0, xy1
    Line.between(point, point)
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


STYLE
  CONSTRUCTORS  
    new Style({
      stroke: '',
      strokeWidth: ''
      fill: ''
    })

  METHODS
    Style.applyTo(element0, element1...)