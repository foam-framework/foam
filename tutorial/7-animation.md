---
layout: tutorial
permalink: /tutorial/7-animation/
tutorial: 7
---

FOAM has a rich facility for reactive programming. Animations are of course just reacting to time.

There is a growing collection of animated views that already know how to animate themselves as their data changes.

To demonstrate, let's make the big image on the phone detail page slide in when you click a thumbnail.

First, open `index.html` and add the following, *after* the `<script>` tag for `bootFOAM.js`:

{% highlight html %}
<script src="foam/core/experimental/aview.js"></script>
{% endhighlight %}

Then go to `PhoneDetailView_toHTML.ft` and near the top, change:

{% highlight js %}
$$imageUrl{ model_: 'ImageView', className: 'phone' }
{% endhighlight %}

to

{% highlight js %}
$$imageUrl{ model_: 'AImageView', className: 'phone' }
{% endhighlight %}

and reload your app. Now when you go to the detail page for a phone and click a thumbnail, the new image will slide in from the bottom.

This works because the `AImageView` performs this animation by default when its image URL changes. It listens for changes to its `data$` property, which is set to `imageURL` from the `PhoneDetailView`. When you click a thumbnail, `imageURL` changes, which makes the `AImageView`'s `data` property update, which triggers the animation.

