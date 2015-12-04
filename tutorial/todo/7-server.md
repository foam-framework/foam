---
layout: tutorial-todo
permalink: /tutorial/todo/7-server/
tutorial: 7
---

## FOAM in Node.js

FOAM works in Node.js as well as on the web. In this optional expansion to the
tutorial, we'll build a server for our Todo list app.

### Launcher script

The equivalent to [index.html]({{ site.baseurl }}/guides/index_html) for Node.js
is [tools/foam.js]({{ site.baseurl }}/guides/node_launcher). It loads a FOAM
model by name, passes it parameters from the command line, and runs its
`execute()` method.

## Servers in FOAM: Agents

FOAM's basic server, `foam.node.Server`, is an empty shell that doesn't serve
anything by default. It expects a list of `agents` that add functionality to the
server.

First, we'll write a simple agent that serves FOAM and our app, like the Python
server.

Create a new directory `PROJECT/js/com/todo/server/`, and a new file in it
called `Agent.js`.

    PROJECT
    |- foam/
    |- js/
    |--- com/
    |----- todo/
    |------- TodoApp.js
    |------- model/
    |--------- Todo.js
    |------- u2/
    |--------- TodoCitationView.js
    |------- server/
    |--------- Agent.js

In the new file `PROJECT/js/com/todo/server/Agent.js`, add the following:

{% highlight js %}
CLASS({
  package: 'com.todo.server',
  name: 'Agent',
  imports: [
    'exportDirectory',
  ],

  methods: [
    function execute() {
      this.exportDirectory('/js', 'js');
      this.exportDirectory('/foam', 'foam');
    },
  ]
});
{% endhighlight %}

### Imports and Exports

All FOAM objects have a *context*, provided when they are created. It can be
referenced as `this.X`, but it's more common to specify `imports` and `exports`.

Everything that a model `imports` gets installed on `this`.
In `com.todo.server.Agent`, we import `exportDirectory`, and then call
`this.exportDirectory`.

### Serving directories

`exportDirectory` is a method exported by the main `foam.node.Server`, so that
agents like ours can easily declare what paths we want to serve.

The first parameter is the URL prefix, the second is the path on the filesystem.

### Running our server

First, shut down the Python server from earlier.

From the `PROJECT` directory, we can run our new server like this:

    nodejs foam/tools/foam.js --classpath=js foam.node.Server \
        agents=com.todo.server.Agent \
        port=8000

Test it out by refreshing the app. The same URLs we've been using should still
work. We have essentially reimplemented the Python simple server using FOAM and
Node.js.

## Serving a DAO

To make things interesting, we want to actually serve `Todo` objects on our
server.

We'll use `foam.node.dao.JSONFileDAO` as the underlying DAO. Expand `Agent.js`
to look like this:


{% highlight js %}
CLASS({
  package: 'com.todo.server',
  name: 'Agent',
  requires: [
    'com.todo.model.Todo',
    'foam.dao.EasyDAO',
    'foam.node.dao.JSONFileDAO',
  ],
  imports: [
    'exportDAO',
    'exportDirectory',
  ],

  properties: [
    {
      name: 'dao',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Todo,
          daoType: this.JSONFileDAO,
          cache: true,
          seqNo: true
        });
      }
    },
  ],

  methods: [
    function execute() {
      this.exportDirectory('/js', 'js');
      this.exportDirectory('/foam', 'foam');
      this.exportDAO(this.dao);
    },
  ]
});
{% endhighlight %}

- We're now requiring `foam.dao.EasyDAO` and `foam.node.dao.JSONFileDAO`.
- We now import `exportDAO` as well as `exportDirectory`.
- The `dao` property has a `factory` that builds our DAO. It's similar to the
  `EasyDAO` we wrote for the client, but the underlying DAO is `JSONFileDAO`
  rather than LocalStorage.
- We've added `this.exportDAO(this.dao)` to `execute()`.

**Restart the server**.

## Wiring up Client and Server

Did you restart the server? Good.

Open up `TodoApp.js` again. First, add `foam.dao.EasyClientDAO` to the `requires`:

{% highlight js %}
requires: [
  'com.todo.model.Todo',
  'com.todo.u2.TodoCitationView',
  'foam.browser.BrowserConfigU2',
  'foam.dao.EasyClientDAO',
  'foam.dao.EasyDAO',
  'foam.mlang.CannedQuery',
],
{% endhighlight %}

and then in the `factory` for `data`, change the `dao` to look like this:


{% highlight js %}
properties: [
  {
    name: 'data',
    factory: function() {
      return this.BrowserConfigU2.create({
        model: this.Todo,
        dao: this.EasyDAO.create({
          model: this.Todo,
          daoType: this.EasyClientDAO,
          cache: true
        }),
        rowView: 'com.todo.u2.TodoCitationView',
        cannedQueryDAO: [
          // ...
        ]
      });
    }
  },
]
{% endhighlight %}

We only changed two things here:

- `daoType` from `'LOCAL'` to `this.EasyClientDAO`
- Removed `seqNo: true` &ndash; the server is taking care of that now.

And that's all it takes! Refresh the page (did you restart the server earlier?)
and you should be talking to the server. Your saved data will disappear, so
create some new entries.

Once you've created some new `Todo` entries, there will be a new file at
`PROJECT/Todo.json`. Take a look in there, and you'll see your `Todo`s.

You can refresh the client and restart the server all you like; the server will
remember that data.

## Next

Right now, your server has a single list of `Todo`s that everyone in the world
shares.

In [Part 8: Auth]({{ site.baseurl }}/tutorial/todo/8-auth) we'll add
authentication and authorization to our server.

