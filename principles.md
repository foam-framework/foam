---
layout: page
title: Principles
permalink: /principles/
---

## Fast is better than slow

FOAM apps should load and run quickly, because users like fast.

FOAM apps should also be written quickly, because developers are solving the
real problem and not writing marshalling code or hand-binding DOM events.

## Data is better than code

Our programs manipulate more or less structured data. So are the programs we
write.

Custom syntax might be nice, but it needs to be parsed, and cannot be extended
without modifying the compiler.

FOAM classes and the properties on them are written and stored as JSON data (
with some extras like functions allowed which are not strictly JSON). The class
that FOAM produces based on your code is not something "other", something that
you can't touch or can only touch through a limited, slow reflection API.
Rather, `this.model_` is made of the same stuff as `this`: properties, methods,
listeners, actions.

### Runtime metaprogramming

Do you wish FOAM's `Property` had support for your wire format? Subclass
`Property` and create properties on your classes using it.

Do you wish FOAM's classes supported `rules` that would declaratively describe
certain conditions and define handlers for them? Subclass `Model` and add a
`rules` property that implements them!

FOAM's `Property` and `Model` classes are "made of the same stuff" as yours, and
can be accessed at runtime. Metadata is different from data only by convention.

Need to specialize some views based on some user-defined data (say, custom
fields in a bug tracker)? Create a basic `Bug` but then dynamically create
subclasses for each set of custom fields. Now the custom fields are as
first-class as the shared ones.


## Composition is better than inheritance

While FOAM supports class and mixin inheritance, inheritance is a rather
limited, tightly coupled way of composing behavior.

Rather, we prefer creating standard interfaces, and making it easy to decorate
them with extra behavior.

Want to add performance logging to your network backend? Don't edit the
original, and don't subclass it either. Write a generic `TimingDAO` (or use
ours) that thinly wraps your real network DAO.

Don't write a custom view for showing only the top few results from a DAO, just
pass any DAO view `myDAO.limit(3)`.

Composition is much more declarative and productive than inheritance, and you
should prefer it whenever practical.


## Interfaces are more important than implementations

FOAM wants you to write your app quickly and painlessly. Glue code is never
essential to the problem, just noise caused by accidents of differing formats
or modes of interaction.

FOAM defines a few standard interfaces (DAOs, views, event binding) that allow
FOAM components to be extremely pluggable.

Don't mock out for backend for testing. Your data source is already a DAO, just
replace it with an array or `MDAO`.

Server API changing? Nothing but your bottommost DAOs need ever know. Ditto for
changing from JSON to a binary wire format. Ditto again for switching hosting
platforms or databases.


