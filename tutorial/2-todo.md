---
layout: tutorial
permalink: /tutorial/2-todo/
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
todo list item. We'll start simple: a title and a boolean isCompleted.

Write the following into the file:

{% highlight js %}
CLASS({
  package: 'com.todo.model',
  name: 'Todo',
  properties: [
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

This doesn't do a whole lot, but there's still enough information here to go a
long way towards a working app with FOAM.



