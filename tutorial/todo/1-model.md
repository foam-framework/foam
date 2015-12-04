---
layout: tutorial-todo
permalink: /tutorial/todo/1-model/
tutorial: 1
---

## Models and Metaprogramming

Don't panic!

FOAM is fundamentally a **modeling framework**. When writing an app using FOAM,
you write **models**, which FOAM uses to build many **features**. See the live
coding on the [main page]({{site.baseurl}}/) for some examples of features.

Models resemble classes in most programming systems: they have a name,
properties, methods. There are two key differences between FOAM's models and,
say, a Java class:

1. FOAM's models are richer, with more information attached.
    - All dependencies are declared, enabling things like the build tool.
    - Properties have a name and type, but also a UI label, `preSet` and
      `postSet` handlers, a default `view`, default values, and much more.
    - Methods can be batched to run per animation frame, or not more than once
      per second, etc.
    - Templates are parsed and turned into methods.
    - And much more.
2. FOAM's models are **data, not code**.

This last point is really the key: FOAM's models are data. They can be
stored in a database, serialized over the network, and more. They can be
processed by tools without the need for parsing. They can contain data and code
for multiple languages, and be used in a web app or to build an Android app.

Modeling is the secret spark that makes everything FOAM does possible.


## Models and the model: terminology collision

A quick point to clear up confusion before we move on. There's an unfortunate
collision around the word "model". We use it in two very different senses in
FOAM.

The first meaning is as used above.

The second is the "M" in "MVC". This is the part of an app responsible for
managing data, and supplying data to the other parts of the app.

Fortunately, it's usually clear from context.

## Next

In [Part 2: Your first model]({{ site.baseurl }}/tutorial/todo/2-todo/), we'll
see what FOAM can do with just a simple model.

