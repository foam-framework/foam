---
layout: tutorial
permalink: /4-templates/
tutorial: 4
---

A template on a model is simply a Javascript function that returns a string of HTML when called. Instead of writing Javascript code by hand, you'll usually use the template syntax.

Templates can also live in external files, which are introduced in [part 6](/tutorial/6-detailview).

## Template Syntax

FOAM's template syntax is a superset of JSP syntax. This means templates are HTML, with the following extras:

{% raw %}
- `<%   %>` encloses Javascript code.
    - Real Javascript, not a restricted subset.
- `<%=  %>` encloses a comma-separated list of Javascript expressions whose values are written to the DOM.
- `{{  }}` inserts a Javascript value, with escaping.
- `{{{ }}}` does the same but without escaping.
- `%%foo` inserts the simple value of `this.foo` into the page.
- `$$foo` inserts the view for `this.foo` at this location. That is, whatever `this.foo$.view` is, it will be created, fed the value of `this.foo`, and inserted into the DOM.
    - `$$foo{ x: 'y', y: 'x' }` allows providing or overriding parameters to that view.
{% endraw %}

### Control Structures

Since `<%  %>` allows embedding arbitrary, real Javascript code, you can create control structures like so:

{% highlight jsp %}
<ul>
  <% for (var i = 0 ; i < list.length; i++ ) { %>
    <li><%= list[i] %></li>
  <% } %>
</ul>
{% endhighlight %}

However, code like this is rarely necessary, since FOAM contains many views that handle creating rows from a collection of data. `DAOListView` from [part 3](/tutorial/3-dao) is one example; `TableView` and `GridView` are two more.

## Inline Templates

Let's define our template for each phone in the catalog. Expand `PhoneCitationView` so it looks like this:

{% highlight js %}
{% raw %}
MODEL({
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

- FOAM uses multi-line comments in templates as a hack for multi-line strings in Javascript.
- Inside a template, `this` is bound to the view itself, **not the `Phone` object**.
- Instead, `this.data` is bound to the `Phone` object.
- The `$$foo` syntax puts a child view at this location. `imageUrl` has its `view` set to `ImageView`, so `$$imageUrl` will render an `ImageView` in the first link tag.
- `$$name{mode: 'read-only'}` will put the child view for the `name` property (defaults to `TextFieldView`) in the second link tag. `mode: 'read-only'` on a `TextFieldView` is simply text.
- Similarly for `$$snippet{mode: 'read-only'}`.

Now reload your app and see that... it's a complete mess. That's because `PhoneCitationView` is putting in `<li>` tags but they're not in a `<ul>`, and the custom CSS for the app is not being loaded.

We'll get back to the CSS shortly. First, let's add a second template, for the top-level `ControllerView`. Add this code to `Controller.js`, expanding our `ControllerView`:

{% highlight js %}
MODEL({
  name: 'ControllerView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      Search: $$search
      Sort by: $$order
      <p>$$filteredDAO{ className: 'phones', tagName: 'ul' }</p>
    */}
  ]
});
{% endhighlight %}

- Many FOAM views support `className` and `tagName`. The default `tagName` for a `DAOListView` is `<div>`, but we want to use `<ul>` here.
- `search` has `view` set to `TextFieldView`, so it will render as a text box.
- `order`'s `view` is `ChoiceView`, which renders a drop-down list.
- `filteredDAO` is the `DAOListView`, which renders the list of entries.

The custom CSS still isn't loaded, so add the following to `index.html`'s `<head>` tag:

{% highlight html %}
<link rel="stylesheet" href="css/app.css" />
<link rel="stylesheet" href="css/bootstrap.css" />
{% endhighlight %}

and reload your app. Now it should look much better, and the search and sort functions work!

[Part 5](/tutorial/5-navigation) will add navigation to our app.

