---
layout: tutorial
permalink: /tutorial/2-model/
tutorial: 2
---

The place to start with any FOAM application is with a first draft of your data model.

The app we're going to build here is shamelessly borrowed from the [AngularJS tutorial](https://docs.angularjs.org/tutorial). It is a simple catalog app the shows a collection of smartphones. It has two views: one for the list of phones and the other for the details of one phone.

You can see the finished app running live [here](/apps/phonecat/Cat.html).

## Defining the Model

Our application has only one FOAM model in its MVC Model: `Phone`. It has many properties, most giving the specifications of the device.

Put the following code in `$PROJECT/Phone.js`:

{% highlight js %}
MODEL({
  name: 'Phone',
  properties: [
    'id', 'age', 'name', 'snippet', 'additionalFeatures', 'android',
    'availability', 'battery', 'camera', 'connectivity', 'description',
    'display', 'hardware', 'sizeAndWeight', 'storage', 'details',
    { name: 'imageUrl', view: 'ImageView' },
    { name: 'images', model_: 'StringArrayProperty' }
  ]
});
{% endhighlight %}

Most of these properties are straightforward. Some are notable:

- `id` is not required, but it's generally a good idea for objects which will be stored in a DAO to have an `id` property. Many DAOs require a primary key, and they will use `id` if it exists.
    - If you want to specify the primary key, define `ids: ['name', 'birthdate']` on the model.
    - If you define `ids`, those values together form the primary key.
    - If you don't have `ids`, but do have an `id` property, DAOs will use that.
    - Failing that, they use the first property in the `properties` array.
- `imageUrl` has its `view` property specified as `ImageView`, so that when we render it in a `DetailView`, an `ImageView` will be created for it.
- `images` is defined as a `StringArrayProperty`, which handles array-valued properties better than the default (`StringProperty`).

If this model doesn't seem to do much, that's because it doesn't. This is purely declarative, just specifying what properties there are and what their types are. (Properties default to `StringProperty` if their `model_` is not specified.)

### Download Bundle

There is a companion file with this tutorial that includes the data about the phones in JSON format, as well as the collection of images of the devices.

Click [here](/tutorial/bundle.zip) to download them. Unpack it into your `$PROJECT` directory. You should get an `img/` directory, `css/` directory, and `phones.js`.

## Next

The [next part](/tutorial/3-dao) of the tutorial introduces DAOs and sets up the basic controller.

