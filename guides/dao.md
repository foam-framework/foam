---
layout: page
title: DAO User Guide
permalink: /guides/dao/
---

## DAOs

A DAO, or Data Access Object, is a universal interface to a collection of
objects.

The guides for DAOs are split into three parts.

[Here]({{ site.baseurl }}/foam/demos/dao.html), we show many examples of
manipulating DAOs.

Below, we discuss the `DAO` and `Sink` interfaces.

Finally, there is a separate
[DAO authorship guide]({{ site.baseurl }}/guides/dao-author).


## Basic DAO operations

Here are the fundamental functions in the interface, written as though
Javascript functions specified return types:

{% highlight java %}
void find(id, sink);
void put(obj, sink);
void remove(objOrID, sink);

Future<Sink> select(sink, options);
Future<Sink> removeAll(sink, options);
void listen(sink, options);
void unlisten(sink, options);
void pipe(sink, options);
{% endhighlight %}

Note that **all these operations are asynchronous**, not just those that return
`Future`s.

All of the operations take a `sink`, whose interface is detailed below. Various
functions on the `sink` are called asynchronously when operations are complete,
and data is available.


### Filtering DAOs

There are four more DAO operations that synchronously return modified DAOs. They
essentially return a window onto part of the data stored in the original DAO.
They can filter, sort, limit results, and skip early results.

{% highlight js %}
DAO where(query);
DAO orderBy(sortOrder);
DAO limit(num);
DAO skip(num);
{% endhighlight %}

These operations can be easily chained:

    dao.where(EQ(this.Todo.IS_COMPLETED, true)).skip(40).limit(20).select(sink)

### Sinks

The `Sink` interface is a target for data retrieved from a DAO. Its functions
are called asynchronously by the DAO.

{% highlight java %}
void put(obj);
void remove();
void eof();
void error(error);
{% endhighlight %}

When each of these is called is detailed as we summarize the DAO operations
below.


### find(id, sink)

Retrieves a single object from the DAO, whose `id` is given.

If the object is found, `sink.put(obj)` is called. If the object is not found,
`sink.error` is called instead.

### put(obj, sink)

Inserts a new object, or updates an existing one. The interface makes no
distinction. Many backends also don't care, and DAO implementations for those
backends which do care may perform a `find()` first to check if the object
already exists.

When the object is stored successfully, `sink.put(newObj)` is called. Why return
the object? Because the DAO is free to modify the object if necessary - filling
in an autoincremented `id`, or a default value, or otherwise massaging the data.


### remove(objOrId, sink)

Deletes a single object from the DAO.

If the removal is successful, `sink.remove(obj)` is called.

**NB**: Trying to remove an object which does not exist is **not** an error.
`remove()` only calls `sink.error` if it fails to communicate with the backend
in some fashion.


### select(sink, options)

This is the main event. `select(sink)` retrieves a collection of results from
the DAO. If unfiltered, `select()` returns everything in the DAO.

Often, `where()`, `orderBy()`, `skip()` and `limit()` will be used first, to
limit the scope of the `select()`.

Note that `options` is almost never manipulated directly. The DAOs returned by
`where()` and friends are actually small wrappers around the original DAO that
populate `options` on a `select()` or `removeAll()`.

`select()` calls `sink.put(obj)` repeatedly, once for each object retrieved. It
then calls `sink.eof()`.

`select()` and `removeAll()` return a `Future<Sink>`, that is, a future whose
value is the same `sink` passed in to `select()`. That future resolves when
the `select()` is completely done, at the same time as `sink.eof()` is called.


### removeAll(sink, options)

`removeAll()` is very similar to `select()`, with the obvious exception that it
removes all matching entries from the DAO instead of returning them.

Be careful! `myDAO.removeAll()` without any filtering will delete every entry.


### listen(sink, options)

`listen()` calls `sink.put(obj)` and `sink.remove(obj)` whenever objects are
`put()` and `remove()`d from the DAO. This can be used to log all changes, for
example. `listen()` will continue streaming results indefinitely.

Note that `listen()` is filtered just like `select()`.
`myDAO.where(...).listen()` will only listen for objects matching the query.

### unlisten(sink)

Stops streaming results to the provided `sink`, which was previously passed to
`listen()`.

### pipe(sink, options)

`pipe()` is essentially `select()` followed by `listen()`: it returns all
currently stored objects, and then streams `put` and `remove` events like
`listen()`.


### where(query)

`where(query)` returns a new DAO that is a filtered window onto the data in the
original.

The `query` is structured using FOAM's mLang syntax. This is a structured,
injection-safe query language written in Javascript. Many examples can be
found in the [DAO examples page]({{ site.baseurl }}/foam/demos/dao.html).

### orderBy(order)

`orderBy(order)` uses a small subset of mLang syntax (see `where()` above) to
specify a sort order.

Some examples:

    myDAO.orderBy(this.MyModel.NAME)
    myDAO.orderBy(DESC(this.MyModel.CREATED_TIME))
    myDAO.orderBy(DESC(this.MyModel.RANK),
        this.MyModel.LAST_NAME, this.MyModel.FIRST_NAME)


### limit(num)

Limits the maximum number of requests returned by the DAO. Mostly useful for
paging results and infinite scrolling.

### skip(num)

Ignores the first `num` results from the DAO (according to the sort order).
Useful for paging and infinite scrolling.

