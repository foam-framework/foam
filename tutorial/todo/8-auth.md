---
layout: tutorial-todo
permalink: /tutorial/todo/8-auth/
tutorial: 8
---

## Auth in FOAM

FOAM has several pluggable components for handling auth. See the
[auth guide]({{ site.baseurl }}/guides/auth) for full details.

### Authentication vs. Authorization

Before we get hands-on, let's draw a careful distinction:

- **Authentication** is verifying who the user claims to be.
- **Authorization** is determining what that user is allowed to see and update.

FOAM has components to help with both parts, as we'll see.

## TODO

That's as far as the tutorial goes for now - sorry!

Here's the short version of using Google auth with FOAM:

1. Create a new app on the [Developer Console](https://console.developers.google.com)
2. Add new OAuth web credentials for it, with the origin `localhost:8000`.
3. Grab the key.
4. Add a property `owner` to `com.todo.model.Todo`, tagged as `hidden: true`.
4. Create a property called `googleClientId` on `TodoApp` that has its
  `defaultValue` set to that key.
5. Export `googleClientId`: `exports: ['googleClientId']`.
6. Add the `googleAuth: true` setting to the client's `EasyClientDAO`.
7. On the server, require the following:
    - `foam.dao.GoogleAuthDAO`
    - `foam.dao.AuthorizedDAO`
    - `foam.dao.PrivateOwnerAuthorizer`
8. Make the server's DAO into the following onion-like layering:
    {% highlight js %}
{
  name: 'dao',
  factory: function() {
    return this.GoogleAuthDAO.create({
      clientId: 'YOUR GOOGLE KEY',
      delegate: this.AuthorizedDAO.create({
        authorizer: this.PrivateOwnerAuthorizer.create({
          ownerProp: this.Todo.OWNER,
        }),
        delegate: this.EasyDAO.create({
          model: this.Todo,
          daoType: this.JSONFileDAO,
          cache: true,
          seqNo: true
        })
      })
    });
  }
}
    {% endhighlight %}

That should do it. This will be expanded into a proper tutorial later, probably
once FOAM has username/password auth instead. Juggling the Google keys is easy
enough if you want Google auth, but it's a pain if you don't.

