---
layout: page
title: Performance
permalink: /performance/
---

There are two established approaches to two-way binding in Javascript: dirty
checking and `Object.observe`.

Dirty checking scales linearly with the number of bindings, and the
overhead gets worse as the values get more interdependent.

`Object.observe` is currently only [supported](http://caniuse.com/#feat=object-observe)
in Chrome and Opera, with no plans to bring it to future versions of IE, Firefox
or Safari.

So how does FOAM get fast, cross-browser two-way binding?

## FOAM's Secret Sauce

When you're manipulating a FOAM object, say a `Person` class you've defined, it
might have an `age` property. You access it in the usual ways for a Javascript
property:

{% highlight js %}
if (myPerson.age < 18) return;
{% endhighlight %}
{% highlight js %}
myPerson.age = 30;
{% endhighlight %}

But `myPerson` is not a vanilla Javascript object, and `.age` is not a vanilla
Javascript property. Instead, `.age` was created using `Object.defineProperty`,
allowing FOAM to define custom getter and setter functions for what appear to be
properties.

This is how FOAM implements its two-way binding. It's also how FOAM implements
many of its other features, like `preSet`, `postSet`, `defaultValue`,
`lazyFactory`, and more.

When you set a property, its `preSet` and `postSet` (if any) are run, and any
listeners subscribed to it are called. When you add a view or bind using
`data$`, listeners are added.

Therefore FOAM's reactive programming scales with the number of values that
change, not the total number in the system, which lets it be fast, and allows
apps with several thousand bindings to still be fast when you search-as-you-type.

### `Events.dynamic` is Magic

When you call `Events.dynamic` (or give a property a `dynamicValue`), you pass
a function that uses arbirtary properties of arbirtary objects, and your
function will run again every time any of them changes.

The function isn't parsed or otherwise examined. Rather, FOAM adds a hook into
the `defineProperty` getter logic, and then runs your function once. The hook
allows it to note all properties read by your function, and attach listeners to
them.

#### But not quite magic enough

This leads to the unfortunate gap in the magic. The following doesn't work,
because `bar` is not read the first time if `foo` is not set yet.

{% highlight js %}
{
  name: 'someProp',
  dynamicValue: function() { return this.foo && this.foo.bar; }
}
{% endhighlight %}

### FOAM Has Nasty Stack Traces

We know. If you've tried to debug into FOAM code, you might have observed a lot
of "junk" layers: `.bind(this)` wrappers, property getters and setters, and
pub/sub code.

We don't have a way to hide these internals from the debugger. It's unfortunate,
but we feel the advantages this `defineProperty` style enables greatly outweigh
its costs.

## The Problem with Dirty Checking

Dirty checkers, for example that used by AngularJS 1.x, scale linearly with the
number of bindings in the system. After the user or the code make changes to any
values in the `$scope`, the system runs a "digest cycle", recomputing values and
checking them against their cached previous values. If dependent values have
also changed, a second pass is made, and so on.

Therefore the total overhead gets worse both with the number of bindings, and
with the interdependence of the values.



## The Problem with `Object.observe`

Two words: [Browser support](http://caniuse.com/#feat=object-observe).
Chrome and Opera only, no plans for anywhere else.

