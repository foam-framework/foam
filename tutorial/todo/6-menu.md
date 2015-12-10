---
layout: tutorial-todo
permalink: /tutorial/todo/6-menu/
tutorial: 6
---

## Menus in the browser

You may have noticed that our Todo Browser has a "hamburger" button in the
corner. If you touch it, it animates a slide-out menu... with nothing in it.

![Empty menu overlay]({{ site.url }}/tutorial/todo/assets/empty-menu.png)

### Under Construction

Sorry, this part of the tutorial needs some love to update it.

You can continue on to [Part 7: Servers]({{ site.baseurl }}/tutorial/todo/7-server)
without this section.

<!--
Let's fill in the menu.

### Canned Queries

`foam.mlang.CannedQuery` is a model that combines an mLang query with a name.
mLangs are FOAM's query language, a companion to the DAO interface that
specifies queries in a generic, extensible way. Since it involves no parsing,
most injection errors are avoided by construction.

For details, see the [mLang guide]({{ site.baseurl }}/guides/mlang). This page
explains the basics, however.

### mLang basics

mLangs are a collection of global Javascript functions, spelled in all caps,
that essentially build the syntax tree for your expression.

For example, `EQ(MyModel.NAME, 'Jerry')` is a query that asserts the `name`
property of an object is exactly the string `'Jerry'`.

There are many more binary operations like this. You won't be surprised to find
`NE` (not equal), `LT`, `LTE`, `GT`, `GTE` for basic equality and comparison.

There are a few more interesting ones, like `CONTAINS` and `CONTAINS_IC`
(case-insensitive). `CONTAINS(MyModel.NAME, 'foo')` is essentially `this.name.indexOf('foo') != -1`.  If the right-hand argument is itself an array, `CONTAINS(a, [b1, b2])` is
true if *any* of `b1`, `b2`, etc. is in `a`.

mLangs support the usual boolean operations as well as comparison: `NOT(query)`,
`AND(q1, q2, q3, ...)`, `OR(q1, q2, q3, ...)`.

Finally, there are singleton queries `TRUE` and `FALSE` which always match, or
always fail to match.

### Properties on your models

FOAM attaches a static object to a model for each of its properties. These
are spelled with all caps, turning `camelCaseNames` to `CAMEL_CASE_NAMES`.

For our `Todo` model, then, we can use `Todo.TITLE` and `Todo.IS_COMPLETED`.

## Defining our canned queries

`BrowserConfig` accepts a DAO of `foam.mlang.CannedQuery` objects, and will list
these entries in the menu.

We want three canned queries:

- "Todo": `EQ(this.Todo.IS_COMPLETED, false)`
- "Done": `EQ(this.Todo.IS_COMPLETED, true)`
- "Everything": `TRUE`

Open up `TodoApp.js`.

First, add `foam.mlang.CannedQuery` to `requires`:
{% highlight js %}
requires: [
  'com.todo.model.Todo',
  'com.todo.u2.TodoCitationView',
  'foam.browser.BrowserConfigU2',
  'foam.dao.EasyDAO',
  'foam.mlang.CannedQuery',
],
{% endhighlight %}

Then expand the `factory` for `data`:

{% highlight js %}
{
  name: 'data',
  factory: function() {
    return this.BrowserConfigU2.create({
      model: this.Todo,
      dao: this.EasyDAO.create({
        model: this.Todo,
        daoType: 'LOCAL',
        cache: true,
        seqNo: true
      }),
      rowView: 'com.todo.u2.TodoCitationView'
      cannedQueryDAO: [
        this.CannedQuery.create({
          label: 'Todo',
          order: 1,
          expression: EQ(this.Todo.IS_COMPLETED, false)
        }),
        this.CannedQuery.create({
          label: 'Done',
          order: 2,
          expression: EQ(this.Todo.IS_COMPLETED, true)
        }),
        this.CannedQuery.create({
          label: 'Everything',
          order: 3,
          expression: TRUE
        }),
      ]
    });
  }
}
{% endhighlight %}

Note that arrays implement the DAO interface.

Now if you run the app and open the menu, you'll see that there are now three
entries, and that choosing one will close the menu and switch to viewing that
subset of the data.

![Alphabetical list]({{ site.url }}/tutorial/todo/assets/menu-alphabetical.png)

Note also that the entries are in alphabetical order, not the order we wrote
them in the file. Let's fix the order.


### Controlling canned query order

Canned queries can provide a `section` property, which groups them into
clusters. They can also provide an `order` property to specify the order within
each section, independently.

For our purposes here, we only have one group, so we'll just set `order` on each
query:
{% highlight js %}
cannedQueryDAO: [
  this.CannedQuery.create({
    label: 'Todo',
    order: 1,
    expression: EQ(this.Todo.IS_COMPLETED, false)
  }),
  this.CannedQuery.create({
    label: 'Done',
    order: 2,
    expression: EQ(this.Todo.IS_COMPLETED, true)
  }),
  this.CannedQuery.create({
    label: 'Everything',
    order: 3,
    expression: TRUE
  }),
]
{% endhighlight %}

And the result:

![Ordered list]({{ site.url }}/tutorial/todo/assets/menu-ordered.png)

## Next

You made it! That's the end of this basic introduction to programming in FOAM.

The surprisingly short [Part 7: Servers]({{site.baseurl}}/tutorial/todo/7-server)
expands this app by adding a server.
[Part 8: Authentication]({{site.baseurl}}/tutorial/todo/8-auth) adds authentication.

The [FOAM tutorial hub]({{ site.baseurl }}/tutorial/0-intro) has many other
places to go.

We also recommend you take a look at the [DAO User Guide]({{ site.url }}/guides/dao).
If you're wondering about reactivity and performance, see [Performance]({{ site.baseurl }}/performance).
-->
