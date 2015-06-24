---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/4-templates/
tutorial: 4
---

A view is responsible for presenting some data to the user. This might be a
single object, or a collection.

In FOAM, a `View` needs to specify some HTML, by returning a Javascript string
from a method called `toHTML()`.

Rather than writing a Javascript function that constructs and returns such a
string, FOAM supports a template syntax. A class can have a `templates` section,
and at load time your templates are compiled into Javascript functions that
return strings.

Templates can also live in external files, which are introduced in
[part 6]({{ site.baseurl }}/tutorial/phonecat/6-detailview).

## Template Syntax

FOAM's template syntax is a superset of JSP syntax. This means templates are
HTML overall, with the following extras:

{% raw %}
- `<%   %>` encloses Javascript code.
    - Real Javascript, not a restricted subset.
- `<%=  %>` encloses a comma-separated list of Javascript expressions whose values are written to the DOM.
- `%%foo` inserts the simple value of `this.foo` into the page.
- `$$foo` inserts the `view` for `this.foo` at this location. That is, whatever
  the `foo` property's `view` is set to, one will be created and inserted here.
    - `$$foo{ x: 'abc', y: 'def' }` will pass along those values to `.create`
      when it builds the view for `foo`.
{% endraw %}

### Control Structures

Since `<%  %>` allows embedding arbitrary, real Javascript code, you can create
control structures like so:

{% highlight jsp %}
<ul>
  <% for (var i = 0 ; i < list.length; i++ ) { %>
    <li><%= list[i] %></li>
  <% } %>
</ul>
{% endhighlight %}

However, code like this is rarely necessary, since FOAM contains many views that
handle creating rows from a collection of data. `DAOListView` from
[part 3]({{ site.baseurl }}/tutorial/phonecat/3-dao) is one example; `TableView` and
`GridView` are two more.

## Inline Templates

Let's define the template for each phone in the catalog. Expand
`PhoneCitationView` so it looks like this:

{% highlight js %}
{% raw %}
CLASS({
  name: 'PhoneCitationView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      <li class="thumbnail">
        <a href="#{{this.data.id}}" class="thumb">$$imageUrl</a>
        <a href="#{{this.data.id}}">$$name{mode: 'read-only'}</a>
        <p>$$snippet{mode: 'read-only'}</p>
      </li>
    */}
  ]
});
{% endraw %}
{% endhighlight %}

- FOAM uses multi-line comments in templates as a hack for multi-line strings in
  Javascript.
- Inside a template, `this` is bound to the view itself, **not the `Phone`
  object**.
- The `Phone` object is `this.data` instead.
- The `$$foo` syntax puts a child view at this location. `imageUrl` has its
  `view` set to `ImageView`, so `$$imageUrl` will render an `ImageView` inside
  the first link tag.
- `$$name{mode: 'read-only'}` will put the child view for the `name` property
  (defaults to `TextFieldView`) in the second link tag, creating the view with
  its `mode` property set to `'read-only'`. `mode: 'read-only'` on a
  `TextFieldView` is simply text in a `<span>`.
- Similarly for `$$snippet{mode: 'read-only'}`.

Now reload your app and see that... it's a complete mess. That's because `PhoneCitationView` is putting in `<li>` tags but they're not in a `<ul>`, and the custom CSS for the app is not being loaded.

We'll get back to the CSS shortly. First, let's add a second template, for the top-level `ControllerView`. Add this code to `Controller.js`, expanding our `ControllerView`:

{% highlight js %}
CLASS({
  name: 'ControllerView',
  extendsModel: 'DetailView',
  requires: [
    'PhoneCitationView',
    'foam.ui.TextFieldView',
    'foam.ui.ChoiceView',
    'foam.ui.DAOListView',
    'foam.ui.ImageView'
  ],
  templates: [
    function toHTML() {/*
      Search: $$search
      Sort by: $$order
      <p>$$filteredDAO{ className: 'phones', tagName: 'ul' }</p>
    */}
  ]
});
{% endhighlight %}

- Most FOAM views support `className` and `tagName`. The default `tagName` for a
  `DAOListView` is `<div>`, but we want to use `<ul>` here.
- `search` has `view` set to `TextFieldView`, so it will render as a text box.
- `order`'s `view` is `ChoiceView`, which renders a drop-down list.
- `filteredDAO` is the `DAOListView`, which renders the list of entries.

The custom CSS still isn't loaded, so add the following to `index.html`'s
`<head>` tag:

{% highlight html %}
<link rel="stylesheet" href="css/app.css" />
<link rel="stylesheet" href="css/bootstrap.css" />
{% endhighlight %}

and reload your app. Now it should look much better, and the search and sort
functions work!

[Part 5]({{ site.baseurl }}/tutorial/phonecat/5-navigation) will add navigation to our
app.

