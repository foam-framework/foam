---
layout: tutorial
permalink: /1-concepts/
tutorial: 1
---

FOAM is, fundamentally, about data. It takes the object-oriented view of data: the smallest unit of data is an object, and an object is a collection of properties and methods.

This part of the tutorial is split into two sections. First, the high-level concepts with a few examples. Second, an [appendix]({{ site.baseurl }}/tutorial/8-appendix) with much more comprehensive details on models, properties, and other parts of FOAM.

## Models

In FOAM, all objects have a **model**. The model is akin to a Java or C++ class: it defines the properties and methods all objects of this type have. Javascript has poor object support; FOAM expands it significantly.

Models have several parts:

- **Properties**: Like public member variables.
    - In FOAM, properties are accessed like plain old Javascript objects, `point.x += 10`, but there can be custom handlers attached to reading and writing the values.
- **Methods**: Plain old methods, as in Java or most other languages.
- **Actions**: Guarded methods for GUIs, whose buttons can be hidden or disabled based on custom conditions.
- **Listeners**: Pre-bound event listeners. These are essentially methods with `this` pre-bound.
    - Listeners can declare they want to be batched. If so, events will be held until either a set time has elapsed (`isMerged: 100` for 100 milliseconds) or until the next animation frame (`isAnimated: true`). Your code is only called once, and the event delivered is the latest one.
- **Templates**: Methods that return HTML strings.
    - Generally not handwritten Javascript, rather created by FOAM's template compiler.

Here's a simple model:

{% highlight js %}
MODEL({
  name: 'Point',
  properties: ['x', 'y'],
  methods: {
    scale: function(s) {
      this.x *= s;
      this.y *= s;
    }
  }
});
{% endhighlight %}

and it can be instantiated and used like this:

{% highlight js %}
var p = Point.create({ x: 10, y: 20 });
p.scale(2);
p.x += p.y;
console.log(p.toJSON());
{% endhighlight %}

which will output

{% highlight js %}
{
  "model_": "Point",
  "x": 60,
  "y": 40
}
{% endhighlight %}

So you can see that, whatever is going on under the hood, these modelled objects can be manipulated very much like plain old Javascript objects: read and write their properties, call their methods, and so on. The main difference is that new instances are created with `MyModel.create({...})` rather than `new MyModel(...)`.

### Extending Models

Models can extend other models, which means they will inherit all of the parent model's properties and methods (and listeners, actions, ...).

{% highlight js %}
MODEL({
  name: 'Point3D',
  extendsModel: 'Point',
  properties: ['z'],
  methods: {
    scale: function(s) {
      this.SUPER(s);
      this.z *= s;
    }
  }
});
{% endhighlight %}

This defines a new model `Point3D` that extends `Point`. It inherits all the properties (`x` and `y`) of `Point`, and adds a new one, `z`. It would inherit the method `scale` too, but instead overrides it.

This overridden method calls `this.SUPER(s)`, which is similar to calling `super.scale(s)` in Java.

Because `super` and `extends` are reserved but unused in Javascript, FOAM uses these alternative names.

### Properties

In the example above, we defined a property simply as a string, `'z'`. This defines a property with that name on the model. There are *many* more properties a property can have. Here's an example of a model with a more interesting property:

{% highlight js %}
MODEL({
  name: 'Event',
  properties: [
    {
      model_: 'IntProperty',
      name: 'time',
      help: 'The current time in milliseconds since the epoch.',
      preSet: function(_, t) { return Math.ceil(t); }
      defaultValue: 0
    }
  ]
});
{% endhighlight %}

The properties on an object are data, and data is modelled. Therefore properties have models of their own, with properties and methods.

A property only has one required property, `name`, but this example sets several more:

- `model_`: This defines the model of this property. An `IntProperty` represents an integer value, and knows how to display itself, print itself, and so on. This is somewhat akin to declaring an `int time;` member variable in Java, but means quite a bit more, as we will see.
- `name`: As noted above, the only property every property requires.
- `help`: Some help text, which might be displayed in a tooltip or other help view. It's up to the view to decide how, or whether, to present this information.
- `preSet`: This function runs when this property is written. It is passed the old and new values, and its return value becomes the actual value stored in the property.
- `defaultValue`: Specifies the default value for this property. Note that when a property is current equal to its `defaultValue`, the value can be omitted from `toJSON` representations, not stored in the database, or not sent over the wire, saving bandwidth and space.

There are many more properties-on-properties: `hidden`, `postSet`, `getter`, `setter`, `factory` and lots more. See the [appendix]({{ site.baseurl }}/tutorial/8-appendix) for more details.


### Listeners

Listeners are called like methods, but they have some special features.

The most basic is that they always have `this` bound properly, avoiding Javascript's worst wart. That way you can pass them as event handlers without having to bind manually.

For more details, see the [appendix]({{ site.baseurl }}/tutorial/8-appendix).


### Templates

Models can have templates. Templates are methods that return snippets of HTML. Template methods can be written as plain old Javascript that returns a string, but they can also be written using a superset of JSP syntax:

{% highlight js %}
{% raw %}
MODEL({
  name: 'IssueCitationView',
  extendsModel: 'DetailView',
  templates: [
    function priorityTemplate() {/*
      <% var pri = this.data.pri || '0'; %>
      <span class="priority priority-{{{pri}}}">Pri {{{pri}}}</span>
    */},

    function toHTML() {/*
      <div id="%%id" class="issue-citation">
        $$owner{model_: "IssueOwnerAvatarView"}
        <div class="middle">
          $$id{ mode: 'read-only', className: 'id' } <% this.priorityTemplate(out); %><br>
          $$summary{mode: 'read-only'}
        </div>
        $$starred{
          model_: 'ImageBooleanView',
          className:  'star',
          trueImage:  'images/ic_star_24dp.png',
          falseImage: 'images/ic_star_outline_24dp.png'
        }
      </div>
    */}
  ]
});
{% endraw %}
{% endhighlight %}

The details of templates belong to [part 4]({{ site.baseurl }}/tutorial/4-templates), but for now let's note a few high-level points:

- Templates can be given either inline as above, or in external files.
- Multi-line strings are hacked into Javascript for the templates by using multi-line comments.
- Template syntax is augmented HTML, a superset of JSP syntax.


## MVC

MVC, or Model-View-Controller, is a pattern for breaking up applications into reusable, decoupled components.

FOAM is deeply MVC, and takes these ideas farther than many frameworks. Most Javascript frameworks are largely about the view. They have little or nothing to say about the data model (cf. AngularJS) and their controllers are generally either automatic and simplistic, or tediously handwritten by developers.

The conventional definition of MVC is as follows:

- **Model:** Stores and represents your data.
- **View:** Presents this data to the user, for viewing and maybe editing.
- **Controller:** Mediates between the other two.

Controllers are frequently either absent, or a mess of glue code that manually binds all the fields in the model to DOM elements of the view. This is neither convenient, nor in the spirit of MVC.

### Terminology Warning

FOAM has an unfortunate terminology collision around the word "model". We use it to mean both:

- models as above, the concept similar to Java classes, and
- the M in MVC, the data model of the application.

The M in MVC is generally a collection of FOAM models, which together define all the data in the application.


### Model

The Model (ie. the M) in a FOAM application is a collection of FOAM models. For example, the data model for an email client might consist of several models: `EMail`, `Attachment`, `Contact`, and maybe `Thread` and `Label`.

Most views in FOAM deal either with a single object, or with a collection of objects. Collections of data all implement the DAO interface.


### DAO - Data Access Objects

Data Access Object, or DAO, is FOAM's term for a collection of objects, all of the same model. There are many implementations of this common interface, including:

- In-memory (lightning fast, with automatic indexing and query optimization)
- `LocalStorage` and `chrome.storage.*`
- `IndexedDB`
- Plain Javascript Arrays
- REST services
- XML and JSON files
- MongoDB via Node.js

In addition there is a large set of DAO decorators, which add extra functionality to other DAOs. This spares each DAO's author from having to reimplement caching, autoincrement, logging, timing, or anything else not specific to the target backend.

DAOs have a rich and extensible query language, which supports filtering, sorting, grouping, aggregation and more. More details of the interface and how to use it are in [part 3]({{ site.baseurl }}/tutorial/3-dao).


### Views

In FOAM, a view is responsible for presenting some data - either a single object or a DAO - to the user.

For single objects, the view is usually a subclass of `DetailView` with a custom template.

For DAOs, there are a variety of views; `TableView`, `GridView` and `DAOListView` are the most common.

### Controllers

Much of the world's programming time is spent writing custom controllers. Frequently this takes the form of tedious glue code, binding fields of the model to DOM elements, and updating the model when events come from the DOM. Javascript frameworks with two-way data binding improve on this, but they still miss much of the possible power of controllers.

In FOAM, we believe that most applications fall into a few categories, and with the right amount of abstraction on both your data and views, a generic and reusable controller for each archetype of app can be created.

For example, FOAM has a reusable `TwoPaneController` for the ubiquitous "list of items on the left with the details of the selected item on the right" style of app.

This is possible because the metadata - the properties and actions on the model - are known. The generic controllers can add search and sort functionality based on the properties of the model, and their types.

These reusable controllers are a major reason why FOAM can be used to develop applications so rapidly - the functional portions of the app can be assembled very quickly, and the majority of development is adjusting the custom templates and styling.


## Reactive Programming

FOAM has very rich support for reactive programming. This is event-driven, with minimal overhead. It does no dirty checking; instead, updates ripple through the data model, updating further parts of the model, or the views.

There are one-way and two-way binding functions, plus variants of each that adapt the values with a function while binding them. (`Events.follow` and `.link`, and `.map` and `.relate`, respectively.)

There is also the extremely flexible `Events.dynamic`. It takes a function with no arguments that is similar to a spreadsheet formula. FOAM will run the function once and capture all the property accesses. Then it attaches listeners to each of those properties, so that your function will be run again every time one of its inputs changes, just like a spreadsheet cell.

### Animation

Animations in FOAM are similarly rich: an animation is a reactive program with time as an input.

FOAM includes a suite of animation functions that make it easy to have components ease in or out, slide smoothly, bounce, and many others.


## Miscellany

FOAM tries to provide many missing utilities from Javascript and web platform. It has fast JSON and XML parsers, a simple parser combinator library, a `SyncManager` for syncing data for offline use, a powerful asynchronous function library, unit and regression testing, and more.

FOAM is largely written in itself, which helps keep it compact despite all these features. Because of this meta-programming nature, FOAM is not very large.

Minified and gzipped, it comes in at 94 KB as of early July 2014. There is a great deal in the core codebase currently that should not be there; as FOAM moves towards release we will cut this at least in half.

## Next

You should proceed either to [part 2]({{ site.baseurl }}/tutorial/2-model) or the [appendix]({{ site.baseurl }}/tutorial/8-appendix) if you're still curious.

