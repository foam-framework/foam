---
layout: tutorial-todo
permalink: /tutorial/todo/4-dao/
tutorial: 4
---

## DAO - Data Access Object

DAO is a universal interface to a collection of data.

FOAM includes implementations of the DAO interface for many different storage
platforms. A full list is available [here]({{site.baseurl}}/guides/dao-implementations).
Some highlights:

- In the browser: IndexedDB and LocalStorage.
- In Node.js: MongoDB, SQLite, JSON and XML files.
- In memory everywhere: `MDAO` &ndash; a blazing fast, query optimizing, in-memory DAO.

### The real magic: decoration

A universal interface is good for hiding the details of different storage
platforms, but the real trick is that we can write decorators that add extra
behavior to any underlying DAO.

FOAM comes with many of these DAO decorators: they add various caching
strategies, logging and performance measurement, perform schema migrations
transparently, and much more.

This design separates concerns: the underlying DAOs talking to real databases
don't need to worry about caching, logging, or anything else. They can stay
focused on their real job &ndash; storing the data in some backend.


## Saving our data

Our app has so far been defaulting to an MDAO for storing our `Todo`s. Since
MDAO only stores data in memory, the data has disappeared on each refresh. Let's
make it persistent.

Edit `PROJECT/js/com/todo/TodoApp.js`.

First, add `foam.dao.EasyDAO` to the `requires`:

{% highlight js %}
requires: [
  'com.todo.model.Todo',
  'foam.browser.BrowserConfig',
  'foam.dao.EasyDAO',
],
{% endhighlight %}


Then edit `data`'s `factory` to be:
{% highlight js %}
{
  name: 'data',
  factory: function() {
    return this.BrowserConfig.create({
      model: this.Todo,
      dao: this.EasyDAO.create({
        model: this.Todo,
        daoType: 'LOCAL',
        cache: true,
        seqNo: true
      })
    });
  }
}
{% endhighlight %}

Try it out, and you'll see that we're now saving the data between reloads.

### EasyDAO

What's going on here? Well, `EasyDAO` is a helper for building a decorated DAO.

You can of course assemble a DAO by hand, but certain patterns are common
enough that we captured them in `EasyDAO`. Here we specify the `model` (`this.Todo`
again), `daoType: 'LOCAL'` (meaning `LocalStorage`), `cache: true` and `seqNo: true`.

The result is a DAO which ultimately uses `LocalStorage`, but is fully cached in
memory, and automatically sets `id` on any newly inserted objects to the next
unused value.


## Next

We're getting there! Next, we'll customize our list rows to make them more
useful in [Part 5: Custom views]({{ site.baseurl }}/tutorial/todo/5-view).
