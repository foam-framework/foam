---
layout: tutorial
permalink: /tutorial/1-concepts/
tutorial: 1
---

FOAM is, fundamentally, about data. It takes the object-oriented view of data: the smallest unit of data is an object, and an object is a collection of properties and methods.

## Modeling Data

In Java, you write a class definition using special syntax:

{% highlight java %}
public class MyClass extends BaseClass {
  private int someField;
  public MyClass(someField) {
    this.someField = someField;
  }
  public int getSomeField() {
    return someField;
  }
  public void setSomeField(int sf) {
    someField = sf;
  }
}
{% endhighlight %}

This creates a *class*, and you can use `new` to create an *instance* of that
class.

FOAM's approach is similar in principle: you write a definition for the class,
and at runtime that creates a class which your code can instantiate.

FOAM's class definitions take the form of a JSON object passed to the `CLASS()`
global function. The following defines a class similar to the Java one above:

{% highlight js %}
CLASS({
  name: 'MyClass',
  extendsModel: 'BaseClass',
  properties: [
    {
      model_: 'IntProperty',
      name: 'someField'
    }
  ]
});
{% endhighlight %}

### Parts of a Class

In both Java and FOAM, a class has a `name`, a parent class
(`extendsModel`) that defaults to a fundamental class (`FObject`), properties
and methods.

That's about where the similarities stop. FOAM's classes are much richer than
their Java counterparts.

FOAM properties are like public member variables, and are accessed in the same
way: `point.x += 10`. But they have very many more features: `postSet` functions
to call when the property's value changes, the `view` to use when displaying
this property to the user, `dynamicValue` for spreadsheet-style reactive
programming, `defaultValue` and [much more]({{ site.baseurl }}/tutorial/8-appendix).

FOAM models support `constants`, mixins (known as `traits`), special kinds of
methods (`actions`, `listeners`, and `templates`) and more.

### A Simple Example

Here's a simple class:

{% highlight js %}
CLASS({
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

So you can see that, whatever might be going on under the hood, these objects
can be manipulated very much like plain old Javascript objects: read and write
their properties, call their methods, and so on. The main difference is that new
instances are created with `MyModel.create({...})` rather than `new MyModel(...)`.

### Extending Classes

Classes can extend other classes, which means they will inherit all of the
parent class's properties and methods (and listeners, actions, ...).

{% highlight js %}
CLASS({
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

This defines a new model `Point3D` that extends `Point`. It inherits all the
properties (`x` and `y`) of `Point`, and adds a new one, `z`. It would inherit
the method `scale` too, but instead overrides it.

This overridden method calls `this.SUPER(s)`, which is similar to calling
`super.scale(s)` in Java.

Because `class`, `super` and `extends` are reserved (but unused) words in
Javascript, FOAM uses these alternative spellings.

### Properties

In the example above, we created a property with a simple string, `'z'`. This
defines a property with that name on the class. There are *many* more
interesting things to set on a property. These are detailed in the
[appendix]({{ site.baseurl }}/tutorial/8-appendix).

### Listeners, Actions and Templates

These are three kinds of special methods on a class. They are called like normal
methods.

Listeners always bind `this` correctly, so they can be conveniently passed as
DOM event handlers. You can also specify `isMerged: 100` or `isFramed: true`,
and multiple calls to the listener will be merged into one call every 100ms, or
one call on the next `requestAnimationFrame`.

Actions represent operations the user can request on an instance of this class,
like `send`ing an email. They are generally rendered in views as a button or
link. Actions can specify a user-visible `label`, and have reactive handlers
`isEnabled` and `isAvailable` that will toggle the button's state.

Templates are, at runtime, methods that return strings. But in the class
definition, they are written in FOAM's template syntax and are compiled at
class load time. The syntax is JSP-style, with several powerful features added.
Templates make it easy to write reactive UIs with two-way data binding.

Templates will be discussed in more detail in
[part 4]({{ site.baseurl }}/tutorial/4-templates), more information about all
three special kinds of methods is in the
[appendix]({{ site.baseurl }}/tutorial/8-appendix).


## MVC

MVC is a classic pattern for breaking up applications into reusable, decoupled components. The conventional definition of MVC is as follows:

- **Model:** Stores and represents your data.
- **View:** Presents this data to the user, for viewing and maybe editing.
- **Controller:** Mediates between the other two.

Many frameworks focus on the model and the view, which are almost by definition
application-specific. Every app needs its own data types, its own forms, and its
own style of presentation. But the definitions of the models and their views can
be pretty lightweight, especially if you're given some extensible, customizable
components for common needs.

FOAM goes a step farther and allows controllers to be generic, so that they can
operate on all kinds of models and views. In many cases, FOAM's default
controllers can be used to build the structure of your application, requiring
you to write code only for application-specific details while the controllers
provide navigation, animations, editing, searching, and more.

### Terminology Warning

FOAM has an unfortunate terminology collision around the word "model".

We use it to mean the M in MVC, but also refer to the JSON object that defines
a class as its "model".

This fact is visible, for example, in the JSON serialization of a FOAM object,
which includes `"model_": "MyClass"`.

### Model

The Model (the M of MVC) in a FOAM application is a collection of FOAM classes.
For example, the data model for an email client might consist of several
classes: `EMail`, `Attachment`, `Contact`, and maybe `Thread` and `Label`.

Most views in FOAM deal either with a single object, or with a collection of
objects. The DAO interface (see below) is FOAM's universal API for collections
of data.


### DAO - Data Access Objects

Data Access Object, or DAO, is a generic interface for a collection of objects,
all of the same class. FOAM's data storage library includes many implementations
of this common interface, including:

- In-memory (lightning fast, with automatic indexing and query optimization)
- `LocalStorage` and `chrome.storage.*`
- `IndexedDB`
- Plain Javascript Arrays
- REST services
- XML and JSON files
- MongoDB via Node.js

In addition there is a large set of DAO decorators, which add extra
functionality to other DAOs. This spares each DAO's author from having to
reimplement caching, autoincrement, logging, timing, or anything else not
specific to the target backend.

DAOs have a rich and extensible query language, which supports filtering,
sorting, grouping, aggregation and more. More details of the interface and how
to use it are in [part 3]({{ site.baseurl }}/tutorial/3-dao) and the
[appendix]({{ site.baseurl }}/tutorial/8-appendix).


### Views

In FOAM, a view is responsible for presenting some data - either a single object
or a DAO - to the user.

For single objects, the view is usually a subclass of `DetailView` with a custom
template.

For DAOs, there are a variety of views; `TableView`, `GridView` and
`DAOListView` are the most common.

### Controllers

We find that most applications fall into a few categories. With the right amount
of abstraction on both your data and views, a generic and reusable controller
for each archetype of app can be created.

For example, FOAM has a reusable `ThreePaneController` for the ubiquitous
"list of filters on the left, table of items on upper right, and details of
selected item on bottom right" style of app. (This archetype fits Gmail, Outlook
and iTunes, for example.) On mobile, we have a reactive controller
(`AppController`) that renders a vertical list and navigates to details when you
tap, for phones. On tablets, it's the ubiquitous list on the left and details on
the right. Animation and navigation are built into the controller, your app need
only specify the views to use for list entries and detail pages, and the DAO of
the data to display.

This is possible because we have so much metadata about the objects. The
properties and actions for your classes are known at runtime. The generic
controllers can add search and sort functionality based on the properties of
your classes.

These reusable controllers are a major reason why FOAM can be used to develop
applications so rapidly - the functional portions of the app can be assembled
very quickly, and the majority of development is then adjusting the custom
templates and styling the app.

Of course, if none of FOAM's controllers suit your needs, you can extend one or
write your own. FOAM is a library, and you can use whichever parts of it suit
your needs.


## Reactive Programming

FOAM has excellent support for reactive programming. Reactive programming is a
spreadsheet-like style of computation that abstracts the details of dataflow.
You specify a value in terms of some others, and FOAM hooks up event listeners
for you to make sure the values are in sync. This saves the programmer from the
burdens of writing event handlers, callbacks and manual data binding.

FOAM's reactive programming support is event-driven, and therefore has minimal
overhead. It does not do dirty checking; instead, each update to a value ripples
through the data model, triggering further updates, and so on. No handlers are
run when none of their inputs have changed. This is why FOAM's reactive
programming support scales so well; it's still very fast with thousands of
bindings.

The various ways of hooking up reactive listeners are detailed in the
[appendix]({{site.baseurl}}/tutorial/8-appendix).

### Animation

Animations in FOAM are similarly rich; an animation is a reactive program with
time as an input, after all.

FOAM includes a suite of animation functions that make it easy to have
components ease in or out, slide smoothly, bounce, spin, orbit, and more.


## Miscellany

FOAM tries to provide many missing utilities from Javascript and web platform.
It has fast JSON and XML parsers, a parser combinator library, a `SyncManager`
that can sync data for offline use, a powerful asynchronous function library,
unit and regression testing, and more.

## Overhead

FOAM is largely written in itself, which helps keep it compact despite all these
features. Because of this meta-programming nature, FOAM is not very large.

Minified and gzipped, it weighs in at 122 KB as of late November 2014. There is
a great deal in the core codebase currently that should not be there; as FOAM
moves towards a 1.0 release we will cut it into smaller pieces.

## Next

You should proceed either to [part 2]({{ site.baseurl }}/tutorial/2-model) or
the [appendix]({{ site.baseurl }}/tutorial/8-appendix) if you're still curious.

