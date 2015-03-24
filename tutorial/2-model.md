---
layout: tutorial
permalink: /tutorial/2-model/
tutorial: 2
---

The app we're going to build here is shamelessly borrowed from the
[AngularJS tutorial](https://docs.angularjs.org/tutorial). It is a simple
catalog app the shows a collection of (amusingly outdated) smartphones. It has
two views: one for the list of phones and the other for the details of one
phone.

You can see the finished app running live
[here]({{ site.baseurl }}/foam/apps/phonecat/Cat.html).


## Defining the Model

The place to start with any FOAM application is with a first draft of your data
model: the M of MVC.

For example, the model for an email client might consist of a handful of
classes: `Email`, `Attachment`, `Contact`, and maybe `Thread` and `Label`.

Our application has only one class in its Model: `Phone`. `Phone` has many
properties, most of them giving the specifications of the device.

Put the following code in `$PROJECT/Phone.js`:

{% highlight js %}
CLASS({
  name: 'Phone',
  properties: [
    'id', 'age', 'name', 'snippet', 'additionalFeatures', 'android',
    'availability', 'battery', 'camera', 'connectivity', 'description',
    'display', 'hardware', 'sizeAndWeight', 'storage', 'details',
    { name: 'imageUrl', view: 'foam.ui.ImageView' },
    { name: 'images', model_: 'StringArrayProperty' }
  ]
});
{% endhighlight %}

Note that providing just the name of a property (`'age'`, `'snippet'`,
`'battery'` and so on) is equivalent to `{ name: 'age' }`.

Most of these properties are straightforward, just the data about each phone.
Some are notable:

- `id` is not required, but it's generally a good idea for objects to have a
  primary key.
    - If you have an `id` property, that's the primary key.
    - Failing that, the first property in the `properties` array is the primary
      key.
- `imageUrl` has `view` specified as `ImageView`, so that when we render it in
  a view, an `ImageView` will be created for it.
- `images` is defined as a `StringArrayProperty`, which handles array-valued
  properties better than the default generic property.

If this class doesn't seem to do much, that's because it doesn't. This is purely
declarative, just specifying what properties there are and a few extra details
about some of them.

### Download Bundle

There is a companion file with this tutorial that includes the data about the
phones in JSON format, as well as the collection of images of the devices.

Click [here]({{ site.baseurl }}/tutorial/bundle.zip) to download them. Unpack it
into your `$PROJECT` directory. You should get an `img/` directory, `css/`
directory, and `phones.js`.

## Next

The [next part]({{ site.baseurl }}/tutorial/3-dao) of the tutorial introduces
DAOs and sets up the basic controller.

