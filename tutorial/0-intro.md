---
layout: tutorial
permalink: /tutorial/0-intro/
tutorial: 0
---

## Overview

FOAM is a reactive MVC Javascript framework which tries to deliver a higher level of abstraction, productivity, and performance. See the [About page]({{ site.baseurl}}/about/) for more about the philosophy, or follow this tutorial to dive right in.

This tutorial is split into several parts:

- Getting Started (below)
- [Core Concepts]({{ site.baseurl }}/tutorial/1-concepts/)
- [`Phone` model]({{ site.baseurl }}/tutorial/2-model/)
- [Controllers]({{ site.baseurl }}/tutorial/3-dao/)
- [Custom Templates]({{ site.baseurl }}/tutorial/4-templates)
- [Navigation]({{ site.baseurl }}/tutorial/5-navigation)
- [`DetailView' and External Templates]({{ site.baseurl }}/tutorial/6-detailview)
- [Animations]({{ site.baseurl }}/tutorial/7-animation)

## Audience

This tutorial is for people who are familiar with Javascript and building web apps, but who do not know FOAM's concepts or execution. It provides a brief explanation of the concepts, interwoven with an in-depth tutorial on writing code in FOAM to build an app which shows a catalog of phones.

## Required Tools

There are only two required tools for this tutorial:

- `git`
- A local web server. We recommend Python's built-in web server module.

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

Launch your web server and direct your browser to this file. Using Python, that looks like:

    python -m SimpleHTTPServer    # Python 2
    python -m http.server         # Python 3

which will serve the current directory on port 8000: [http://localhost:8000/](http://localhost:8000/).

Loading the page should show the "FOAM Powered" logo, and no JS console errors.

If that's what you're seeing, then congratulations! You've got FOAM running and you're ready to move on to the tutorial proper, with [Part 1: Core Concepts]({{ site.baseurl }}/tutorial/1-concepts).

