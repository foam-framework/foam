---
layout: tutorial-todo
permalink: /tutorial/todo/5-view/
tutorial: 5
---

## FOAM Views

It's very unlikely that the default list row view is going to serve for your
app. It looks at your model, and guesses at an interesting, string-ish property
to put in the row.

For our `Todo` model, it guessed `title`. That's a good guess, but we'd like to
have the `isCompleted` checkbox next to each item in the list.

### View basics

FOAM's U2 view library is based on `foam.u2.Element`. `Element` has several
methods for building DOM elements and wiring up reactive values. There is also a
template syntax, which we will use here.

`foam.u2.View` is an important subclass of `Element`. It adds a `data`,
property, representing the object currently being viewed. `data` might be a
modeled object, or a string or other Javascript value.

### Creating our view

First, let's make a new directory `PROJECT/js/com/todo/u2`, with a new file
`TodoCitationView.js`:

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

and fill the file with the following:

{% highlight js %}
{% raw %}
CLASS({
  package: 'com.todo.u2',
  name: 'TodoCitationView',
  extends: 'foam.u2.View',
  templates: [
    function initE() {/*#U2
      <div class="$">
        {{this.data.title}}
      </div>
    */},
  ]
});
{% endraw %}
{% endhighlight %}

If you reload the app, you'll see that nothing changed. That's because we're not
yet using our new view.

We'll fix that in a moment, but first, let's look into what's going on in that template.

### Template Syntax

Any model can have `templates`, which are run through a parser. The default parser
is the old U1 HTML template parser, but we override that here to use the U2
parser.

A full description of the syntax can be found in the
[template guide]({{ site.baseurl }}/guides/templates), but here's a brief
summary:

- Javascript doesn't support multiline strings, so we hack them in with
  `function`s whose entire body is a `/* block comment */`.
- Adding `#U2` right at the start of a template enables the U2 parser.
    - It will become the default soon.
- In CSS classes, `$` is expanded to the model name with dashes instead of
  periods.
    - In this case, `$` becomes `com-todo-u2-TodoCitationView`.
- `{% raw %}{{ expression }}{% endraw %}` inserts the result of the expression at that spot.
    - Here we're putting in `this.data.title`.
- `(( real JS code ))` runs the literal Javascript code.
- `<obj:property ... />` puts the default `view` for `obj.property` here.

When the template parser is finished, our `TodoCitationView` model has an
`initE` method that returns an `Element` constructed from our template.

### External Templates

You can also put templates in separate files, named `MyModel_templateName.ft`.
For example, `TodoCitationView_initE.ft`.

Then in your model's `templates` section, instead of adding an inline template,
just add it by name: <br/>`{ name: 'initE' }`.

## Wire in our new view

By default, the Browser uses `foam.u2.md.CitationView` for the list rows. We're
going to configure it to use our new `com.todo.u2.TodoCitationView`.

Edit `TodoApp.js`.

Add `'com.todo.u2.TodoCitationView'` to the `requires`:
{% highlight js %}
requires: [
  'com.todo.model.Todo',
  'com.todo.u2.TodoCitationView',
  'foam.browser.BrowserConfig',
  'foam.dao.EasyDAO',
],
{% endhighlight %}

Whenever the list view in the Browser wants to create a row for some object,
it checks if that object has a `toRowE` or `toE` method. These methods are
optional, but if defined they should return an `Element`.

Edit `Todo.js` and let's define `toRowE` for it.
{% highlight js %}
CLASS({
  package: 'com.todo.model',
  name: 'Todo',
  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'title',
    },
    {
      type: 'Boolean',
      name: 'isCompleted',
      label: 'Completed'
    },
  ],

  methods: [
    function toRowE(X) {
      return X.lookup('com.todo.u2.TodoCitationView').create({ data: this }, X);
    }
  ]
});
{% endhighlight %}

(Don't worry about what that X parameter is doing there. We're hoping to clean
up this flow in the future.)

<!--
TODO: Improve the developer experience here. toFooE as a property that adapts from strings?
-->

If you reload the app, you'll see that our change is working - but the app isn't
really improved!

![unstyled title]({{ site.url }}/tutorial/todo/assets/citation-title-only.png)

Our `title` is rendering properly, but it's not nicely styled, and we don't have
the checkbox yet.


## Values and Reactivity

The template parser turns `{% raw %}{{expressions}}{% endraw %}` into a call to
`Element.add()`. `add()` accepts a variety of things:

- `Element`s
- Strings
- Anything with a `toE()` method that returns an `Element`
- `Value`s.

In FOAM, a `Value` is a kind of object-oriented pointer. It has `get()` and
`set()` methods, as well as `addListener()`.

For every property `foo` on a model, instances have both `foo` and `foo$`.
`foo$` is a `Value` for `foo`.

If you add `this.foo` to an `Element`, the *current* value is copied. If you add
`this.foo$` instead, the `Element` listens for changes and updates the DOM.

Two-way binding is achieved by adding an editable view for a property, like
we're about to do for `isCompleted`.


## Adding the Checkbox

Let's add the checkbox for `isCompleted` to our `TodoCitationView`. We'll also
switch to `title$`, so the title will react properly.

Edit the template to read:

{% highlight js %}
{% raw %}
function initE() {/*#U2
  <div class="$">
    <:isCompleted />
    {{this.data.title$}}
  </div>
*/},
{% endraw %}
{% endhighlight %}

Here we're using the `<:someProperty />` syntax to insert a two-way `View` for a
property.

![checkbox with label in its own row]({{ site.url }}/tutorial/todo/assets/citation-checkbox-1.png)

It worked, but it still doesn't look right.

<!-- TODO: Turn this into a differently-styled under-the-hood section. -->
(Under the hood, properties are themselves modeled objects with properties,
methods, etc. The above looks up the Property object for `isCompleted` and
checks its `view` property. For `Boolean` properties, that defaults to
`foam.u2.Checkbox`, which is what appears.)


### Attributes on Views

`View`s can tag their properties with `attribute: true`. If a property is tagged
as an attribute, the template parser will look for that attribute to be set on
the XML tag.

Many views, including `Checkbox`, support a `showLabel` property &ndash; let's
set it to false in our template:

{% highlight js %}
{% raw %}
function initE() {/*#U2
  <div class="$">
    <:isCompleted showLabel="false" />
    {{this.data.title$}}
  </div>
*/},
{% endraw %}
{% endhighlight %}

And now we're getting closer:

![checkbox without label in its own row]({{ site.url }}/tutorial/todo/assets/citation-checkbox-2.png)

We'll have to add some CSS to finish customizing our citation view.

## CSS Templates

In both U1 and U2, models can include a template called `CSS`. That template's
output will be installed on the document exactly once.

We mentioned the `$` CSS class shorthand earlier. In a `CSS` template, it
expands like it does in an `initE` template, to eg. `.com-todo-u2-TodoCitationView`.

The [CSS guide]({{ site.url }}/guides/css) explains more about the various
features of the `CSS` templates.

### CSS for TodoCitationView

Expand `TodoCitationView.js` to look like this:

{% highlight js %}
{% raw %}
CLASS({
  package: 'com.todo.u2',
  name: 'TodoCitationView',
  extends: 'foam.u2.View',
  templates: [
    function CSS() {/*
      $ {
        align-items: center;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
      }
    */},
    function initE() {/*#U2
      <div class="$">
        <:isCompleted showLabel="false" />
        {{this.data.title$}}
      </div>
    */},
  ]
});
{% endraw %}
{% endhighlight %}

Now it renders nicely:

![checkbox rendering nicely in the row]({{ site.url }}/tutorial/todo/assets/citation-finished.png)

## Next

Our app has come together, at least concerning the basics.

Next we'll set out to allow separate views of pending, completed and all
`Todo`s. Before we can go there, we'll need to be more familiar with the DAO
interface.

We recommend reading the [DAO user guide]({{ site.baseurl }}/guides/dao), and
then continuing the tutorial with
[Part 6: Canned Queries]({{ site.baseurl }}/tutorial/todo/6-canned-query).

