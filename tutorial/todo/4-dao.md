---
layout: tutorial-todo
permalink: /tutorial/todo/4-dao/
tutorial: 4
---

## DAO - Data Access Object

DAO is a universal interface to a collection of data.

FOAM includes implementations of the DAO interface for many different storage
platforms. A sampling:

- In the browser: IndexedDB and LocalStorage.
- In Node.js: JSON and XML files, MongoDB.
- In memory everywhere: MDAO, our blazing fast, query optimizing, in-memory DAO.

### The real magic: decoration

A universal interface is good for hiding the details of different storage
platforms, but the real trick is that we can write decorators that add extra
behavior to any underlying DAO.

FOAM comes with many of these DAO decorators: they can add several caching
strategies, logging and performance measurement, perform schema migrations
transparently, and much more.

That also spares the underlying DAOs talking to real databases from having to
worry about implementing those features. They can stay focused on their real job
- storing the data in whatever backend.



## Saving our data

Our app has so far been defaulting to an MDAO for storing our `Todo`s. Since
it's in-memory, the data has disappeared on each refresh. Let's make it
persistent.

Edit `js/com/todo/TodoApp.js`.

First, add `foam.dao.EasyDAO` to the `requires`.

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

Try it out, and see that we're now saving the data between reloads.

### EasyDAO

What's going on here? Well, `EasyDAO` is a helper for building a decorated DAO.

You can assemble your DAO by hand, but certain patterns are common
enough that we captured them in `EasyDAO`. Here we specify the `model` (`this.Todo`
again), `daoType: 'LOCAL'` (meaning `LocalStorage`), `cache: true` and `seqNo: true`.

The result is a DAO which ultimately uses `LocalStorage`, but is cached in
memory, and automatically sets `id` on any newly inserted objects to the next
unused value.


## Next

We're getting there! Next, we'll customize our list rows to make them more
useful in [Part 5: Custom views]({{ site.baseurl }}/tutorial/todo/5-view).
