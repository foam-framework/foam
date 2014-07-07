---
layout: tutorial
permalink: /8-appendix/
tutorial: 8
---

This appendix introduces further details about some parts of FOAM that aren't necessary for the main tutorial.

## Properties

### Properties-on-properties

Properties are modelled objects too, which means they have their own methods and properties.

Several of these properties on properties are very relevant to writing your own models. Here are some of them, in roughly descending order of usefulness:

- `postSet: function(old, nu) { ... }` is called with the old and new values of this property, after it has changed.
- `preSet: function(old, nu { ... }` is called with the old and new values of the property when it's *about* to change. The return value of `preSet` is the value which is actually stored.
- `defaultValue`: Provide a fixed default value for this property. It won't actually be stored on each object, saving memory and bandwidth.
- `defaultValueFn: function() { ... }`: A function that's called *every time* the default value is required. Can use `this` to refer to the object in question, so you can compute the default based on some other properties.
- `factory: function() { ... }` is called once during `init` after creating a new object, the value returned becomes the value of this property.
    - This is commonly used as `factory: function() { return []; }` to make each object have its own empty array. `defaultValue: []` would make all instances share the one array!
- `view` specifies the *name* of the view that should be used to render this property. Defaults to `TextFieldView` for default properties; other `FooProperty` models may have other approaches.
- `required: true` indicates that this field is required for the model to function correctly.
- `transient: true` indicates that this field should not be stored by DAOs.
- `hidden: true` indicates that this field should not be rendered by views.
- `label: 'string'` gives the label a view should use to label this property, if labeling it.
- `help: 'string'` explanatory help text for this property, which could go in a tooltip or just serve as documentation in the code
- `getter: function() { ... }` returns the current value of this property. When this is used, the property is a "pseudoproperty" that has no real value, but is usually computed from others.
- `setter: function(nu) { ... }` is called to set the current value of the property. When this is used, the property is a "pseudoproperty" that has no real value, but is usually computed from others.
- `dynamicValue: function() { ... }` is passed to `Events.dynamic`, which turns this property into a spreadsheet cell. The function you provide will be re-run every time any of its inputs changes, and the return value becomes the value of the property.
- `aliases: ['string', 'array']` defines other names for this property. They can be used to access the same underlying value.

There are some more having to do with tables, i18n, autocomplete and more. See `core/mm2Property.js` for the complete list for `Property`; `core/mm3Types.js` adds `IntProperty` and friends that may have more specific properties for their type.

### Property Types

We showed `IntProperty` above; there are many more types of properties. Most you can easily guess what they do:

`StringProperty` (the default), `BooleanProperty`, `DateProperty`, `DateTimeProperty`, `IntProperty`, `FloatProperty`, `FunctionProperty`, `ArrayProperty`, `ReferenceProperty`, `StringArrayProperty`, `DAOProperty`, `ReferenceArrayProperty`.

There are many more; most of these are defined in `core/mm3Types.js`.

## Methods on the Model

On models themselves, statically, there are a handful of useful methods.

- `SomeModel.name` is the name of the model.
- `SomeModel.create()` creates a new instance of the model.
- `SomeModel.isInstance(o)` checks if `o` is an instance of the model (or a sub-model).
- `SomeModel.isSubModel(OtherModel)` returns `true` if `OtherModel` is a descendant of `SomeModel`.

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
- Listeners can be merged, or batched. The first event that comes in starts the clock, when the timer expires, your handler is fired *once* with the *most recent* event.
    - `isMerged: 100` will merge events and fire the real code 100ms after the *first* event arrives. After that time expires, another event arriving will start the clock again. This is useful to avoid spamming database or network updates.
    - `isAnimated: true` will merge events and fire your code on the next animation frame. This is useful to avoid redrawing more than once per frame. It receives the most recent event, as above.


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

## DAOs

The DAO interface looks like this, if you pretend Javascript supports interfaces:

{% highlight js %}
interface DAO extends Sink {
  void   put(obj, opt_sink);
  void   remove(id, opt_sink);
  void   find(query, sink);
  Future select(sink);
  Future removeAll(query, sink);
  Future update(expression);
  void   listen(sink);
  void   pipe(sink):  // select() + listen()
  void   unlisten(sink);
  DAO    where(query);
  DAO    limit(count);
  DAO    skip(count);
  DAO    orderBy(comparators...);
}
{% endhighlight %}

a `Sink` looks like this:

{% highlight js %}
interface Sink {
  void put(obj);
  void remove(obj);
  void eof();
  void error(msg);
}
{% endhighlight %}

Every DAO is also a sink, making it trivial to pull data from one DAO to another.

Here's an example of using the DAO interface to make a query:

{% highlight js %}
dao
  .skip(200)
  .limit(50)
  .orderBy(EMail.TIMESTAMP)
  .where(
    AND(
      EQ(EMail.TO,        'kgr@google.com'),
      EQ(EMail.FROM,      'adamvy@google.com'),
      GT(EMail.TIMESTAMP, startOfYear)))
  .select(
    GROUP_BY(EMail.SUBJECT, COUNT()));
{% endhighlight %}

This is generally SQL-like, but instead of parsing a string it constructs the query directly. This avoids parsing overhead, and completely avoids SQL injection. It also adds some typechecking, though Javascript can only take that so far.

This query syntax works on all DAOs, including plain Javascript arrays. It is also extensible - the `MLang` syntax - `AND`, `EQ`, and so on - are simple expressions, and you can write new ones if needed.

