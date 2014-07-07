---
layout: tutorial
permalink: /8-appendix/
tutorial: 8
---

This appendix introduces further details about some parts of FOAM that aren't necessary for the main tutorial.

## Listeners

Listeners are like methods, but `this` is always bound to the object, making them easier to pass as event handlers.

{% highlight js %}
MODEL({
  name: 'Mouse',
  properties: [ 'x', 'y' ],
  methods: {
    connect: function(element) {
      element.addEventListener('mousemove', this.onMouseMove);
    }
  },

  listeners: [
    {
      name: 'onMouseMove',
      isAnimated: true,
      code: function(evt) {
        this.x = evt.offsetX;
        this.y = evt.offsetY;
      }
    }
  ]
});
{% endhighlight %}

The listener is attached to the object like a normal method, which can be called directly with `this.onMouseMove()`. Under the hood, however, there are several differences.

- Listeners always have `this` bound properly, so they can be passed as callbacks, as above, without being explicitly bound.
- Listeners can be merged. When events are merged, it's in a "last in, only out" fashion, where the `event` parameter passed to the actual code is the latest one.
    - `isAnimated: true` will merge events and fire the real code on the next animation frame. This is useful to avoid redrawing more than once per frame.
    - `isMerged: 100` will merge events and fire the real code 100ms after the **first** one. This is useful to avoid spamming database updates.


## Actions

Actions are guarded, GUI-friendly methods. FOAM will run code you supply to determine whether the button for this action should be hidden, visible but disabled, or enabled.

{% highlight js %}
MODEL({
  // ...
  actions: [
    {
      name: 'start',
      help: 'Start the timer',

      isAvailable: function() { return true; },
      isEnabled:   function() { return ! this.isStarted; },
      action:      function() { this.isStarted = true; }
    }
  ],
  // ...
});
{% endhighlight %}

By default, an action is always visible and enabled (so the `isAvailable` above is unnecessary). This button is always visible but only enabled when `this.isStarted` is false. When the button is clicked while enabled, `action` is called. If the button is disabled, nothing happens.


## Property Types

We showed `IntProperty` above; there are many more types of properties. Most you can easily guess what they do:

`StringProperty` (the default), `BooleanProperty`, `DateProperty`, `DateTimeProperty`, `IntProperty`, `FloatProperty`, `FunctionProperty`, `ArrayProperty`, `ReferenceProperty`, `StringArrayProperty`, `DAOProperty`, `ReferenceArrayProperty`.

There are many more; most of these are defined in `core/mm3Types.js`.

## Methods on the Model

On models themselves, statically, there are a handful of useful methods.

- `SomeModel.name` is the name of the model.
- `SomeModel.create()` creates a new instance of the model.
- `SomeModel.isInstance(o)` checks if `o` is an instance of the model (or a sub-model).
- `SomeModel.isSubModel(OtherModel)` returns `true` if `OtherModel` is a descendant of `SomeModel`.

## Methods on the `Object` prototype

FOAM injects several properties and methods onto all objects:

- `model_`: Every modelled object has a pointer to its `Model`. (Including `Model` itself: `Model.model_ === Model`)
- `TYPE`: same as `model_.name`
- `o.equals(x)` compares `o` and `x`
- `o.compareTo(x)` returns the usual -1, 0 or 1.
- `o.hashCode()` is similar to Java.
- `o.diff(x)` returns a diff of `o` against `x`.
- `o.clone()` returns a shallow copy of `o`.
- `o.deepClone()` is of course a deep copy.
- `o.toJSON()` and `o.toXML()` return JSON or XML as a string. Parsers are included to read them in again.
- `o.write(document)` writes the default view (see below) of the object into the document.

