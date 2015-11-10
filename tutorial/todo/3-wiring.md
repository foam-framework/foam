---
layout: tutorial-todo
permalink: /tutorial/todo/3-wiring/
tutorial: 3
---

## Central app setup

As our first step, let's build a basic model for the heart of our app. This will
specify the most basic wiring: what model we're viewing, how the data is stored,
and how to view it.

Create the file `$PROJECT/js/com/todo/TodoApp.js` and put the following into it:

{% highlight js %}
CLASS({
  package: 'com.todo',
  name: 'TodoApp',
  extends: 'foam.browser.ui.BrowserView',
  requires: [
    'com.todo.model.Todo',
    'foam.browser.BrowserConfig',
  ],
  properties: [
    {
      name: 'data',
      factory: function() {
        return this.BrowserConfig.create({ model: this.Todo });
      }
    }
  ]
});
{% endhighlight %}

You can check that this new rendition of our app is working by going to [http://localhost:8000/foam/index.html?model\_=com.todo.TodoApp&classpath=../js/](http://localhost:8000/foam/index.html?model_=com.todo.TodoApp&classpath=../js/). It should be identical to before.

So what's going on with this new model?

- It extends `foam.browser.ui.BrowserView`, which you might recognize from the
  old query parameters. This is the central view that defines the default look
  of the browser. We're extending it slightly by overriding its `data` property.
- We specify `requires`. FOAM models can depend on other models. Here we require
  our `Todo` model, as well as `foam.browser.BrowserConfig`, which is the spec
  tells the Browser about our app. It has many properties, but most of them have
  sane defaults; we need only set the `model` to get the browser working.
- We define a `data` property. All FOAM views have a `data` property, and are a
  window onto that data. We might have multiple views of the same underlying
  data, such as in the app now, when we can have a row in the list and the details
  for a `Todo` open at the same time.
- This `data` property has a `factory` function. Factories are run at instance
  creation time, and their return value is the value for the property.
- This `factory` shows how to construct instances of models in code, as
  `SomeModel.create({ key: value, ... })`. We don't use `new` because there's a
  lot of extra legwork going on behind the scenes in `create`, like calling
  `factory` functions.
- It also shows how `requires` works: it includes the requested model as
  `this.ModelName`. Therefore we have `this.BrowserConfig` and `this.Todo`.

That's a lot of details in a small snippet of code! But we haven't improved the
app at all, yet. We've just restructured how we're loading it.

## A few quick improvements

There's some low-hanging fruit that would improve our app experience quite a
bit.

### Hidden properties

First, let's hide the `id` property, since it's really an internal primary key.

You can set `hidden: true` on a property, and it will be ignored in the
generated UI. Let's do that now: open up `js/com/todo/model/Todo.js` and edit
the `id` property to look like this:

{% highlight js %}
{
  name: 'id',
  hidden: true
}
{% endhighlight %}

Reload the app, and the `id` field is gone:

![Details without ID field]({{ site.url }}/tutorial/todo/assets/id-hidden.png)

### Specifying a view

Our `isCompleted` property is a `BooleanProperty`. The default view for such a
property is a switch-like toggle. That makes sense for turning an option on or
off, but not for completing a checklist item. Let's switch to the
`CheckboxView` instead.

Still with the `Todo.js` file open, edit the `isCompleted` property to look like
this:

{% highlight js %}
{
  model_: 'BooleanProperty',
  name: 'isCompleted',
  view: 'foam.ui.md.CheckboxView'
}
{% endhighlight %}

You can set the `view` for any property, and a generated UI will use it:

![Details with Checkbox for completed]({{ site.url }}/tutorial/todo/assets/checkbox.png)

### UI labels

This checkbox view is better, but it's also labeled awkwardly as "Is Completed".
Let's fix that too, by setting the `label` property. All properties have a
`label`, but it defaults to `name` converted from `camelCase` to "Camel Case".
We can override it here, like so:

{% highlight js %}
{
  model_: 'BooleanProperty',
  name: 'isCompleted',
  label: 'Completed',
  view: 'foam.ui.md.CheckboxView'
}
{% endhighlight %}

![Details with new label]({{ site.url }}/tutorial/todo/assets/relabeled.png)

## Next

You will have noticed by now that every time you reload the app to see the
changes, the data has disappeared. That's annoying, so let's fix it in [Part 4:
DAOs]({{ site.baseurl }}/tutorial/todo/4-dao/).

