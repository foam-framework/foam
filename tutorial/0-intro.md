---
layout: tutorial
permalink: /0-intro/
tutorial: 0
---

## Overview

FOAM, **Feature-Oriented Active Modeler**, is a data-centric, very MVC Javascript framework. More details can be found on the [About page]({{ site.baseurl }}/about/) but this tutorial aims to be standalone.

We fundamentally believe in programming at a higher level - of abstraction, productivity, and performance.

Therefore FOAM is a _meta_-programming framework.
It is reactive and highly declarative - you specify the properties on objects, and how they react when their values change.
Very little code is left to be written in an imperative style - mostly event handlers that update a few properties.

The parts of the tutorial are as follows:

- Getting Started (below)
- [Core Concepts]({{ site.baseurl }}/tutorial/1-concepts/)
- [`Phone` model]({{ site.baseurl }}/tutorial/2-model/)
- [DAOs]({{ site.baseurl }}/tutorial/3-dao/)
- [Custom Templates]({{ site.baseurl }}/tutorial/4-templates)
- [Navigation]({{ site.baseurl }}/tutorial/5-navigation)
- [`DetailView' and External Templates]({{ site.baseurl }}/tutorial/6-detailview)
- [Animations]({{ site.baseurl }}/tutorial/7-animation)

## Audience

This tutorial is for people who are familiar with Javascript and building web apps, but who do not know FOAM's concepts or execution. It provides a brief explanation of the concepts, interwoven with an in-depth tutorial on writing code in FOAM to build an app which shows a catalog of phones.

## Required Tools

There are only two required tools for this tutorial:

- `git`
- A local web server. We recommend either running

        python -m SimpleHTTPServer       # python 2

    or

        python -m http.server            # python 3

Either will serve the current working directory on [http://localhost:8000](http://localhost:8000).

## Getting Started

Let's dive right in. Make a new directory for your project, switch to it, and download FOAM:

    mkdir $PROJECT
    cd $PROJECT
    git clone https://github.com/foam-framework/foam.git

Now you've got a subdirectory `foam/` that holds all the code for FOAM, along with numerous demos and test pages.

The core library is split across many files, but you only need to include one in your HTML document: `core/bootFOAM.js`. There is likewise `core/foam.css` which should be included for some views to work properly.

Create `$PROJECT/index.html` with the following contents:

{% highlight html %}
<html>
  <head>
    <script src="foam/core/bootFOAM.js"></script>
    <link rel="stylesheet" href="foam/core/foam.css" />
  </head>
  <body>
    <script>
      document.write(FOAM_POWERED);
    </script>
  </body>
</html>
{% endhighlight %}

Loading that page ([http://localhost:8000/](http://localhost:8000/)) should show the "FOAM Powered" logo, and no JS console errors.

If that's what you're seeing, then congratulations! You've got FOAM running and you're ready to move on to the tutorial proper, with [Part 1: Core Concepts]({{ site.baseurl }}/tutorial/1-concepts).

