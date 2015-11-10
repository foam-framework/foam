---
layout: tutorial-todo
permalink: /tutorial/todo/5-view/
tutorial: 5
---

## FOAM Views

It's very unlikely that the default list row view is going to serve for your
app. It just guesses at an interesting, string-ish property from your model.

For our `Todo` model, the `title` property is a good guess, but we'd like to
have the checkbox visible on the list as well as in the detail view.

### Base views

FOAM has three main models you might want to extend to build your own custom
view:

- `foam.ui.View` completely re-renders itself every time its `data` changes.
- `foam.ui.SimpleView` doesn't react at all when its `data` changes.
- `foam.ui.md.DetailView` doesn't repaint itself - it expects its child views to
  update themselves if their portion of the `data` changed.

The choice between them isn't always clear. Generally, `SimpleView` is for views
of a single value, like a string or boolean, while `DetailView` is for modeled
objects.

Since we're building a "citation" or "summary" view for a `Todo`, we'll use
`foam.ui.md.DetailView` as our base class.

### Creating our view

First, let's make a new package:

    mkdir $PROJECT/js/com/todo/ui
    $EDITOR $PROJECT/js/com/todo/ui/TodoCitationView.js

and will the file with the following:

{% highlight js %}
CLASS({
  package: 'com.todo.ui',
  name: 'TodoCitationView',
  extends: 'foam.ui.md.DetailView',
  templates: [
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        $$title
      </div>
    */},
  ]
});
{% endhighlight %}

If you reload the app, you'll see that nothing changed. That's because we're not
yet using our new view. We'll get to that in a moment, but first, let's look
into what's going on in that template.

### Template syntax

A model can have `templates`, which are run through a parser. The default parser
is the HTML template parser. A full description of the syntax can be found in
the [template guide]({{ site.baseurl }}/guides/templates). For now,
these quick notes will suffice:

- Javascript doesn't support multiline strings, so we hack them in with
  `function`s whose entire body is a `/* block comment */`.
- `<% real JS code %>` runs the literal code.
- `<%= expression %>` inserts the result of the expression at that spot.
- `$$property` puts the default `view` for that property here.

When the template parser is finished, our model has a `toHTML` method that
returns a string based on our template.

### What the heck is going on?

Even if the raw syntax makes sense, there are some strange things in the
template above.

- All `View`s have an `id` property, which by default is a generated value like
  `view23`. They're automatically generated to be unique when the view is
  created. The outermost DOM element should usually have its `id` property set
  to `this.id`, like we do here.
- Views also have `className` and `extraClassName` properties. The convenience
  method `cssClassAttr()` combines these properties, if set, into a
  `class="..."` string and returns it.

Once we understand those two general principles for constructing a view, we can
see what's going on here. We make a fairly default view, and then insert a view
of the `title` property.

### Wire in our new view

We need to override the default list view with our own. FOAM has a variety of
views that expect a DAO and render its contents in some fashion. The four main
ones are:

- `foam.ui.DAOListView` is a basic list, used by default.
- `foam.ui.ScrollView` is an infinite-scrolling version that uses native browser
  scrolling and can handle 100,000 rows at 60fps on mobile.
- `foam.ui.(md.)TableView` renders an HTML `<table>`.
- `foam.ui.(md.)FlexTableView` renders a table with adjustible columns and
  infinite scrolling.

By default, the browser uses a `DAOListView` with `rowView` set to
`foam.ui.md.CitationView`. We're going to override that to use our new
`TodoCitationView` instead.

Edit `TodoApp.js`.

First, add `'com.todo.ui.TodoCitationView'` to the `requires`:
{% highlight js %}
requires: [
  'com.todo.model.Todo',
  'com.todo.ui.TodoCitationView',
  'foam.browser.BrowserConfig',
  'foam.dao.EasyDAO',
],
{% endhighlight %}

Then update the `data` `factory`:

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
      }),
      listView: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'com.todo.ui.TodoCitationView'
      }
    });
  }
}
{% endhighlight %}

This `factory_` syntax is commonly used in FOAM, for declaratively specifying a
model and some default values to give to its properties.

We're configuring our browser, by overriding its default `listView` with a new
one: a `DAOListView` of `TodoCitationView`s.

If you reload the app, you'll see that our change is working - but the app isn't
really improved!

![Editable and labeled]({{ site.url }}/tutorial/todo/assets/edit-and-label.png)

It's now got an editable title, and it will actually save properly if you make
an edit and blur the view, but that's not really what we were going for.


### Further customizing our template

Most views in FOAM understand the `mode` property, which can be set to
`'read-write'` (the default), `'read-only'`, or `'final'`. Many views render
differently when their `mode` is `'read-only'`. We can specify extra values by
changing the `TodoCitationView`'s template to read

    $$title{ mode: 'read-only' }

This syntax allows setting properties on the view being created for `title` (in
this case, a `foam.ui.md.TextFieldView`.

![Read-only and labeled]({{ site.url }}/tutorial/todo/assets/just-label.png)

That makes it non-editable, but the label is still distracting. Update it again,
to:

    $$title{ mode: 'read-only', floatingLabel: false }

and now we're back where we started:

![Just the title]({{ site.url }}/tutorial/todo/assets/just-title.png)

Let's add the main reason why we've set out to build a custom citation view: the
checkbox.

Update the template again, this time to read:

    $$isCompleted
    $$title{ mode: 'read-only', floatingLabel: false }

![With checkbox, part 1]({{ site.url }}/tutorial/todo/assets/with-checkbox-1.png)

and now we've got the checkbox -- but the layout is screwed up and the label for
the checkbox is unnecessary. Let's remove that too, by overriding the view's
`label` property.

    $$isCompleted{ label: '' }
    $$title{ mode: 'read-only', floatingLabel: false }

![With checkbox, part 2]({{ site.url }}/tutorial/todo/assets/with-checkbox-2.png)

Better, but the layout is still busted.

### Custom CSS for our views

If you define a `template` for your model called `CSS`, the CSS contained inside
will be installed into the document once, the first time an instance of the view
is created. Let's create one now:

{% highlight js %}
CLASS({
  package: 'com.todo.ui',
  name: 'TodoCitationView',
  extends: 'foam.ui.md.DetailView',

  properties: [
    {
      name: 'className',
      defaultValue: 'todo-citation'
    }
  ],

  templates: [
    function CSS() {/*
      .todo-citation {
        align-items: center;
        border-bottom: 1px solid #eee;
        display: flex;
        min-height: 48px;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        $$isCompleted{ label: '' }
        $$title{ mode: 'read-only', floatingLabel: false }
      </div>
    */},
  ]
});
{% endhighlight %}

Note that we're adding the `className` property and giving it a `defaultValue`.
When you set a `defaultValue` on a property, any instance that doesn't have its
own value for that property doesn't bother to store the default. That saves
memory and network bandwidth, and makes it cheap to add properties that are only
rarely set.

Now we've got a nicely laid out row for each `Todo`, and the checkboxes work
properly:

![With checkbox, part 3]({{ site.url }}/tutorial/todo/assets/with-checkbox-3.png)

## Next

Our app has come together, at least concerning the basics.

Next we'll set out to allow separate views of pending, completed and all
`Todo`s. Before we can go there, we'll need to be more familiar with the DAO
interface.

We recommend reading the [DAO user guide]({{ site.baseurl }}/guides/dao), and
then continuing the tutorial with
[Part 6: Canned Queries]({{ site.baseurl }}/tutorial/todo/6-canned-query).

