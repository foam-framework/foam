---
layout: tutorial-todo
permalink: /tutorial/todo/2-todo/
tutorial: 2
---

## Your first model

That's more than enough wonking about metaprogramming and models. Let's get down
to building something.

### Organizing code in FOAM

FOAM models have Java-style package names, like `com.todo.model.Todo`. We're
going to create a Java-style directory structure to match.

    mkdir -p js/com/todo/model
    $EDITOR js/com/todo/model/Todo.js

Now we've got a file open for our first model, which will be a basic model for a
todo list item.

### The `Todo` model

We'll start simple: an `id`, a `title` and a boolean `isCompleted`.

Write the following into the file:

{% highlight js %}
CLASS({
  package: 'com.todo.model',
  name: 'Todo',
  properties: [
    {
      name: 'id'
    },
    {
      name: 'title'
    },
    {
      model_: 'BooleanProperty',
      name: 'isCompleted'
    }
  ]
});
{% endhighlight %}

This is pretty straightforward. `CLASS()` is a built-in function provided by
FOAM that declares a new model. It gets passed a spec in the form of a JSONish
object. Note that the model is declared using a data structure, not syntax. Code
is data, and FOAM treats it as such.

Most objects in FOAM should have an `id` property. This is used as their primary
key for many DAOs.

### Where's the code?

This doesn't really contain any code, it's basically a schema for a Todo item.

But there's still enough information here to go a long way towards a working app
with FOAM. Try [this link](http://localhost:8000/foam/index.html?model_=foam.browser.BrowserConfig&model=com.todo.model.Todo&view=foam.browser.ui.BrowserView&classpath=../js/)
to see your budding app in action. It should look like this:

![List view screenshot]({{ site.url }}/tutorial/todo/assets/model-only-list.png)
![Detail view screenshot]({{ site.url }}/tutorial/todo/assets/model-only-details.png)

There are definitely things we'll want to clean up, but we just got a lot of
logic for free! This uses FOAM's `foam.browser` suite to generate an app for our
model. The browser is for the common class of apps that have a list of items and
allow editing and creation of those items. The menu allows filtered views of the
data, and there's search-as-you-type with advanced syntax. All of this is
constructed automatically by examining the model you built.

This is what we mean by metaprogramming in FOAM. If you tell FOAM about the
shape of your data, it can generate lots of functionality for you.


### You're still steering

FOAM can give you as much or as little help as you like. If your app doesn't
fit this list-and-details pattern, you don't need to use `foam.browser` at all.
If you want a completely different look, you can still get the search and menu
from the controller, but replace the view completely.

FOAM doesn't force you into anything. If you don't like one of our views,
replace it with one of your own. Every component can be replaced, and any
components you write will still fit together neatly with other built-in
components.

FOAM's goal is to make many things much easier, but also to make nothing harder.


## Next

The next step is to override some of the defaults in the FOAM browser, and
start making this app more usable.

The tutorial continues with [Part 3: Wiring]({{ site.baseurl }}/tutorial/todo/3-wiring/).

