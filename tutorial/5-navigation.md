---
layout: tutorial
permalink: /tutorial/5-navigation/
tutorial: 5
---

Usually, you'll be using one of FOAM's generic controllers, which can handle navigation for you. In this tutorial, we'll do navigation by hand to demonstrate more advanced templates, the template lifecycle, and other concepts.

We'll begin by expanding the `ControllerView` to make the decision of whether to show us a single phone's page or the list. Expand it to look like this:

{% highlight js %}
MODEL({
  name: 'ControllerView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      <% if ( window.location.hash ) {
        var view = PhoneDetailView.create({ model: Phone });
        this.addChild(view);

        this.data.dao.find(window.location.hash.substring(1), { put: function(phone) {
          view.data = phone;
        }});

        return view.toHTML();
      } else { %>
        Search: $$search
        Sort by: $$order
        <p>$$filteredDAO{className: 'phones', tagName: 'ul'}</p>
      <% } %>
    */}
  ],
  methods: {
    init: function() {
      this.SUPER();
      window.addEventListener('hashchange', function() {
        document.body.innerHTML = this.toHTML();
        this.initHTML();
      }.bind(this));
    }
  }
});
{% endhighlight %}

Note that our original `ControllerView` template is now the `else` branch, ie. what will be shown when `window.location.hash` is empty.

- We're navigating by setting `window.location.hash` to the `id` of the phone we want to see.
- We can put real Javascript control structures inside `<%  %>` tags, and indeed the `if` branch is written entirely in Javascript.
- In that first branch, we create a `PhoneDetailView`, which we'll define shortly. We tell it what `model` it should be the view for, but not what object is currently being viewed.
- All views have `addChild`, which adds another view to a list of child views. The default `initHTML` (see below) will call `initHTML()` on all the child views recursively.
- We look up the phone in the master `dao`, not the filtered one. `find(id, sink)` will locate a single item by its ID.
    - The `id` of the phone we want to find is the hash, with the leading `#` chopped off.
    - We provide a custom `sink`, which is just a Javascript object with a `put` function. `put` will be called, if defined, when a DAO finds an object matching a query.
    - When the phone is found, the DAO will call our sink's `put` function with the `Phone` object. Our `put` will set `view.data` to the phone, and the `PhoneDetailView` will automatically update itself to display this new data.
- We also add an `init` method. This is similar to a constructor and is called during `ControllerView.create()`. It is very important to call `this.SUPER()` first thing in any custom `init` we write, since the parent models do several important things in `init`.
- Our `init` adds a listener to the `hashchange` event, which will re-render the template into the page. DOM templates have a two-step lifecycle:
    - `toHTML()` is the main template function. It returns a string which gets added to the DOM.
    - `initHTML()` needs to run after everything is added to the DOM. It hooks up any listeners, calls `initHTML` recursively on children, and so on. You generally won't need to write custom `initHTML` methods.


Now we need to define `PhoneDetailView`. As we did before, let's simply define it as an empty submodel of `DetailView`:

{% highlight js %}
MODEL({
  name: 'PhoneDetailView',
  extendsModel: 'DetailView'
});
{% endhighlight %}

That will be enough to let us reload the page and see it working, though it will be ugly as before.

Try it! Click on a phone in the catalog, and you will switch to its detail view. Use your browser's Back button, and you're back at the catalog.

[Part 6]({{ site.baseurl }}/tutorial/6-detailview) shows external templates and explores `DetailView`s further.

