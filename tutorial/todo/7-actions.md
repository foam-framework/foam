---
layout: tutorial-todo
permalink: /tutorial/todo/7-actions/
tutorial: 7
---

## Actions

FOAM models can contain more than `properties` and `requires`. There are
`methods`, naturally, but also several specialized kinds of methods.

- `listeners` are pre-bound to `this`, so they can be passed as event listeners.
  They can also declare themselves to run on the next animation frame, or not
  more than once every `n` milliseconds.
- `templates` we have already seen. These are written in the template syntax and
  parsed into Javascript functions that return strings.
- `actions`, our interest here, define user actions that can appear in a UI,
  with code to execute when they are clicked.


### Our basic "delete" action

Let's add an action to `Todo` for deleting that item.

First, open up `js/com/todo/model/Todo.js` and add the `actions` section:

{% highlight js %}
CLASS({
  package: 'com.todo.model',
  name: 'Todo',
  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'title',
    },
    {
      model_: 'BooleanProperty',
      name: 'isCompleted',
      label: 'Completed',
      view: 'foam.ui.md.CheckboxView'
    },
  ],

  actions: [
    {
      name: 'delete',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg' +
          'AAABgAAAAYCAQAAABKfvVzAAAAOklEQVQ4y2NgGPzgv8L/B/' +
          '9h4MF/BXxK8QDqaCDH/aSaP6phVAMuDa+wqn+BW4P//5eYy' +
          'v/7DvI8DwBDJ5LB6mdU8gAAAABJRU5ErkJggg==',
      code: function(X) {
        X.dao.remove(this.id);
        X.stack.popView();
      }
    }
  ]
});
{% endhighlight %}

The icon URL is the base-64 encoded icon of the trash can icon from Google's
[Material Design icon collection](https://google.github.io/material-design-icons/).

`iconURL` is not a required property - if omitted, the button will be labeled
with the `name` or `label` of the action instead.

Reload the app, and notice that when you're looking at the details of a `Todo`,
there's a trash can icon in the header:

![Action icon]({{ site.url }}/tutorial/todo/assets/action-icon.png)

### What is this `X`?

FOAM objects all have a "context", spelled `this.X`. Contexts form a tree, with
child contexts inheriting from their parents but overriding or adding new
values.

A model can include `imports` and `exports` sections, detailing what properties
they expect from their context, and which properties they add to the context for
their children.

There's more about contexts in the [context guide]({{ site.baseurl }}/guides/context).

For our purposes here, it suffices to note a few things:

- First, that our action's `this` is some instance of `Todo`, the one that was
  being viewed when the user clicked the delete button in the header.
- `this.X`, therefore, is the context *in which the `Todo` was created*. But
  we're more interested in the context where the button appeared. That's a
  common case for actions, so actions are passed that context as their first
  argument, here called `X`.
- `X.dao` is the main DAO of the application, our DAO of `Todo`s.
- `X.stack` is the instance of the `StackView`, which is responsible for laying
  out the different pages on mobile and desktop.

So our action code removes this `Todo` from the DAO, and then pops the
topmost view from the view stack, which turns out to be the detail view of the
just-deleted `Todo`. The result is that pushing the delete button removes the
`Todo` and lands the user back on the menu. Great!

### A subtle bug

There's a problem with our action, right now. The delete button appears when
creating a new `Todo`, as well as editing an old one. It doesn't make sense to
delete a nonexistent `Todo`, so let's hide the action when the `Todo` isn't real
yet.

Actions support two optional helper functions, called `isAvailable` and
`isEnabled`. When you write these functions, they react whenever any value they
reference is changed, and are run again.

When `isAvailable` returns a falsy value, the button is hidden. When `isEnabled`
returns a falsy value, the button may be present but disabled.

We'll add `isAvailable` to our action, as follows:

{% highlight js %}
{
  name: 'delete',
  isAvailable: function() { return this.id; },
  iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg' +
      'AAABgAAAAYCAQAAABKfvVzAAAAOklEQVQ4y2NgGPzgv8L/B/' +
      '9h4MF/BXxK8QDqaCDH/aSaP6phVAMuDa+wqn+BW4P//5eYy' +
      'v/7DvI8DwBDJ5LB6mdU8gAAAABJRU5ErkJggg==',
  code: function(X) {
    X.dao.remove(this.id);
    X.stack.popView();
  }
}
{% endhighlight %}

This works because the `id` property is set by the `EasyDAO` when we save a new
`Todo`.


![Action on edit]({{ site.url }}/tutorial/todo/assets/action-on-edit.png)
![No action on new]({{ site.url }}/tutorial/todo/assets/action-not-new.png)

## Reactive programming in FOAM

The above `isAvailable` function is strange. It doesn't listen for any events,
and yet it will be called exactly whenever the `id` of a `Todo` is changed.

How does that work? The short answer is "magic". The slightly longer answer is
that sufficiently advanced technology is indistinguishable from magic.

Understanding how this engine works is not essential for programming in FOAM, so
feel free the skip the next section.

### How FOAM makes reactive programming fast everywhere

Expanding a bit more: FOAM includes a sophisticated reactive programming system
that enables the two-way data binding of `data` and other properties to views.

This reactive programming system is highly efficient, and cross-platform. It's
fast and available on mobile and desktop. It does no expensive dirty checking;
only those bindings which depend directly on a changed value are re-evaluated.

This works because `myTodo.id` is not a simple value. It's actually a Javascript
"property", built with `Object.defineProperty`, and has custom `get` and `set`
functions. When the code `newObj.id = newID()` is run inside the `EasyDAO`, that
calls the `set` function for the `id` property, which runs the property's
`preSet` or `adapt`, if they exist, then any listeners to this property, or the
whole object, and finally `postSet`.

For functions like `isAvailable`, FOAM enables a "bookkeeping" mode that records
every property `get` that's called, then runs the function, and turns off
bookkeeping. That way, it knows every property that `isAvailable` had to touch
to generate its value. FOAM attaches listeners to each of those properties,
which will run `isAvailable` again if any of their values change.

You can get this same magical behavior by calling `Events.dynamic(func)`, or
giving a property a `dynamicValue`, which is like a factory that re-runs
whenever its dependencies change.

## Next

You made it! That's the end of this basic introduction to programming in FOAM.

There are enough places to go next that they have a page to themselves:
[FOAM tutorial hub]({{ site.baseurl }}/tutorial/0-intro).

