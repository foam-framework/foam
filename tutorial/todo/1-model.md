---
layout: tutorial-todo
permalink: /tutorial/todo/1-model/
tutorial: 1
---

## Models and Metaprogramming

"Metaprogramming" might sound awesome, or strange. That's why it's "choose your
own adventure" time: read whichever of the following sections feels more
comfortable. You don't need to understand FOAM's metaprogramming principles to
write an app using it.

### "Metaprogramming? Models? Get to the point!"

FOAM includes, among other things, a class system for Javascript. That's not
very exciting; there are dozens of those.

What makes FOAM's class system interesting is that it includes many more
features than most. Java's class system has member variables and methods. There
are a few interesting keywords like `static` and `synchronized`, but generally
speaking they have an access level, name, and type.

Properties on FOAM's classes have names and types, but also `preSet` and
`postSet` handlers, default values, creation-time factories, UI labels, and
more.

### "Metaprogramming? Sounds awesome!"

FOAM is a metaprogramming framework, which means it provides tools for modeling
data, and generating lots of tedious code from that model. With a model of your
data, FOAM can build a default detail view, serialize it into JSON, XML and
more, store it in LocalStorage, IndexedDB, MongoDB, MySQL, and many more places.

It can do all of those things because you've given a detailed description of
what your data is. This goes well beyond the basics found in most object
oriented languages: name and type. FOAM models have properties and methods, but
also listeners, user actions, i18n strings, relationships to other collections
of data, and more.

Properties in FOAM have `preSet` and `postSet` handlers, UI labels, default
values, creation-time factory functions. The have flags that declare a property
to be required, hidden in the UI, or not saved to databases. They can declare a
foreign key reference, be an array of such references.


## Models and the model: terminology collision

A quick point to clear up confusion before we move on. There's an unfortunate
collision around the word "model". We use it in two very different senses in
FOAM.

First, the sense used above, on this page. A model is like a class, a detailed spec or
schema for your data. At the core of your app, you'll likely have a handful of
these, with names like `Email`, `Contact`, `Label` and `Attachment`.

Second, "model" as the M in "MVC". This is the high-level component of an app
responsible for feeding data to the app. In FOAM, this MVC Model generally takes
the form of a DAO for each model in the first sense. (A DAO is a Data Access
Object, a universal interface for data access, see the
[DAO User Guide]({{ site.baseurl }}/guides/dao).)

## Next

Move on to [Part 2: Your first model]({{ site.baseurl }}/tutorial/todo/2-todo/) to get
started building our first model.

