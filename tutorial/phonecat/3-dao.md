---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/3-dao/
tutorial: 3
---

## DAO - Data Access Objects

Data Access Object, or DAO, is a generic interface for a collection of objects.

The interface supports fetching and deleting many rows (`select`, `removeAll`),
fetching and deleting single rows (`find`, `remove`) and inserts (`put`). The
interface also includes a rich and extensible query language, for filtering,
sorting, and aggregation.

The model (M of MVC) defined in the previous chapter describes what our data is:
a `Phone`. The DAO defines how we store a collection of `Phone`s.

FOAM's data storage library contains many implementations of the common DAO
interface:
- In-memory (lightning fast, with automatic indexing and query optimization)
- `LocalStorage` and `chrome.storage.*`
- `IndexedDB`
- Plain Javascript arrays
- REST services
- XML and JSON files
- MongoDB (in Node.js)

There are also many DAO "decorators", which add extra functionality on top of
other DAOs. This spares each DAO's author from having to reimplement caching,
autoincrement, logging, and timing.

## Controllers

At the top level of our app, we have a Controller, the C of MVC, which is responsible for connecting the views and models together. For this simple app, we have a small Controller with very few parts. There are a couple of inputs (search box, sort order), and the data (from the `phones.js` file).

The Controller knows nothing about how the app is laid out visually, it just creates the components and binds them together.

- A `TextFieldView` for the search box.
- A `ChoiceView` for the sort order drop-down.
- A `DAOListView` for the list of phones.

Let's look into the code, which should go in a new file, `$PROJECT/Controller.js`:

{% highlight js %}
CLASS({
  name: 'Controller',
  properties: [
    {
      name: 'search',
      view: { factory_: 'foam.ui.TextFieldView', onKeyMode: true }
    },
    {
      name: 'order',
      defaultValue: Phone.NAME,
      view: { factory_: 'foam.ui.ChoiceView', choices: [
        [ Phone.NAME, 'Alphabetical' ],
        [ Phone.AGE,  'Newest' ]
      ] }
    },
    { name: 'dao', defaultValue: phones },    // phones comes from phones.js
                                              // It's an in-memory DAO
                                              // of the phone data
    {
      name: 'filteredDAO',
      model_: 'foam.core.types.DAOProperty',
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'PhoneCitationView',
        mode: 'read-only'
      },
      dynamicValue: function() {
        return this.dao.orderBy(this.order)
            .where(CONTAINS_IC(SEQ(Phone.NAME, Phone.SNIPPET), this.search));
      }
    }
  ]
});
{% endhighlight %}

Let's explain a few pieces of this code in detail.

- Setting `view` to an object like
  `{ factory_: 'TextFieldView', onKeyMode: true }` specifies the class
  (`TextFieldView`) that should be used for this view, as well as some arguments
  to pass to the view, like setting `onKeyMode` to `true`.
- `search` has its `view` set to `TextFieldView`. By default, `TextFieldView`
  fires updates when it loses focus or the user presses Enter. Setting
  `onKeyMode: true` will make it fire an update on every keystroke, meaning the
  list of phones will filter as you type.
- `order` defaults to sorting by `Phone.NAME`.
    - For each property `someProp` on a class `MyClass`, there is a static
    property spelled `MyClass.SOME_PROP` that is used for sorting and filtering
    in DAOs. There are several examples of these here.
- `order` is displayed as a `ChoiceView`, which represents a drop-down box.
    - `ChoiceView` expects an array of choices. Each choice is an array
      `[internalValue, 'user label']`. The value of the `order` property is
      two-way bound to the current value of the drop-down box.
- `dao` is the master DAO containing all the phones.
    - `phones.js` creates a global array called `phones`. We set the
    `defaultValue` of our `dao` property to this global value. Remember that
    `Array` implements the DAO interface.
- `filteredDAO` is the interesting DAO. This is the one that actually drives the
  main view on the page, which gets filtered by the search and ordered by the
  sort order.
    - Its view is `DAOListView`. This view shows a vertical list of rows, one
      for each entry in the DAO it is bound to. The view for each row is
      `PhoneCitationView`, which we'll define shortly.
    - `dynamicValue` takes a function that is treated like a spreadsheet cell:
      it registers listeners on each of the inputs in the function. Then when
      any of the inputs changes, the function will be run again and the value of
      `filteredDAO` updated.
        - Here, those inputs are `this.order` and `this.search`.
        - The return value becomes the value of `this.filteredDAO`, which will
          be a sorted and filtered version of the master `this.dao`.
    - `CONTAINS_IC` checks if the string on the left contains the string on the
      right, ignoring case.
      - `SEQ(Phone.NAME, Phone.SNIPPET` concatenates the phone's name and
        description blurb.


## `DetailView` and Default Templates

We told our `DAOListView` above that its `rowView` is called
`PhoneCitationView`. We need to define this view, which will specify how to
display a summary of a phone for the catalog page.

`DetailView` is a very important view in FOAM. It has a `data` property which is
set to some FOAM object. The `DetailView` has a default template, which runs
through the list of `properties` on the object, and displays their
`name`s (or `label`s, if set) in the left column of a table, and their `view`s
on the right.

Therefore we don't really have to define a custom view here, if we don't care
what it looks like. To demonstrate, let's load our app using the default
`DetailView` templates. Then we'll add custom templates so we get the layout and
style we want.

Add these two dummy views to `Controller.js`:

{% highlight js %}
CLASS({
  name: 'PhoneCitationView',
  extendsModel: 'foam.ui.DetailView'
});

CLASS({
  name: 'ControllerView',
  extendsModel: 'foam.ui.DetailView',
  requires: [
    'PhoneCitationView',
    'foam.ui.TextFieldView',
    'foam.ui.ChoiceView',
    'foam.ui.DAOListView',
    'foam.ui.ImageView'
  ]
});
{% endhighlight %}

Models should name every other model on which they depend - those they will
create, or use in their templates - in `requires`. See the
[Appendix]({{ site.baseurl }}/tutorial/phonecat/8-appendix) for more details on
`requires`, `imports`, `exports` and `arequire`.

With this, the catalog page will be usable, though ugly. Update `index.html` to be the following:

{% highlight html %}
<html>
  <head>
    <script src="foam/core/bootFOAM.js"></script>
    <link rel="stylesheet" href="foam/core/foam.css" />
    <script src="Phone.js"></script>
    <script src="phones.js"></script>
    <script src="Controller.js"></script>
  </head>
  <body>
    <foam id="cat" model="Controller" view="ControllerView"></foam>
  </body>
</html>
{% endhighlight %}

If you load that up in your browser, you'll see that it's far from pretty, but
that searching and sorting work properly.

The `<foam>` tag is a convenience for loading a given model and view, and
inserting it into the DOM.

Next we'll add custom templates in
[part 4]({{ site.baseurl }}/tutorial/phonecat/4-templates).

There's also quite a bit more about the DAO interface in the
[appendix]({{ site.baseurl }}/tutorial/phonecat/8-appendix).

