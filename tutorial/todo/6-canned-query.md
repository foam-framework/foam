---
layout: tutorial
permalink: /tutorial/6-canned-query/
tutorial: 6
---

## Menus in the browser

You may have noticed that our Todo Browser has a "sausage menu" button in the
corner. If you touch it, it animates a slide-out menu... with nothing in it.

Let's fill in the menu.

### Canned Queries

`foam.mlang.CannedQuery` is a model that combines an mLang query with a name.
mLangs are FOAM's query language, a companion to the DAO interface that
specifies queries in a generic way. Since it involves no parsing, most injection
errors are avoided by construction.

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
(case-insensitive). `CONTAINS(a, b)` is essentially `b.indexOf(a) != -1`.  If
the left-hand argument is itself an array, `CONTAINS([a1, a2], b)` is true if
*any* of `a1`, `a2`, etc. is in `b`.

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

Let's continue expanding the `factory` for `data` in `TodoApp.js`:

{% highlight js %}
{
  name: 'data',
  factory: function() {
    return this.BrowserConfig.create({
      dao: this.EasyDAO.create({
        model: this.Todo,
        daoType: 'LOCAL',
        cache: true,
        seqNo: true
      }),
      listView: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'com.todo.ui.TodoCitationView'
      },
      cannedQueryDAO: [
        this.CannedQuery.create({
          label: 'Todo',
          expression: EQ(this.Todo.IS_COMPLETED, false)
        }),
        this.CannedQuery.create({
          label: 'Done',
          expression: EQ(this.Todo.IS_COMPLETED, true)
        }),
        this.CannedQuery.create({
          label: 'Everything',
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


## Next

The last part of this basic tutorial is to add user actions to our `Todo` model,
so that they will appear in the header of the detail view.

We'll add a "delete" button in
[Part 7: User Actions]({{ site.baseurl }}/tutorial/7-actions).

