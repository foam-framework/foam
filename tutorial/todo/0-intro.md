---
layout: tutorial-todo
permalink: /tutorial/todo/0-intro/
tutorial: 0
---

## Overview

FOAM is several things: a modeling framework, a Javascript MVC library, a
collection of Views, and more.

The single thread uniting FOAM is the goal to work at a higher level: of
abstraction, of productivity, and of performance. The
[front page]({{ site.baseurl }}/) has more information about FOAM's philosophy.

This tutorial is a hands-on introduction to how FOAM can help you build
*fast apps fast*.

## Audience

You should be at least somewhat familiar with Javascript and building apps for
the web. You definitely don't need to be an expert.

No familiarity with FOAM is assumed: we're starting from scratch here.

## Required Tools

You'll need `git` and a local web server. We suggest Python's built-in web
server module, which is easy to use and probably already installed.

### Windows

If you're on Windows, you probably don't have Python already installed. You
should install a simple web server to host your FOAM app for development.

Note that the commands given throughout the tutorial are for Unix-like
platforms and won't work on Windows. Their meaning is explained, so you should
be able to perform the same actions (new directory, etc.).

## Getting Started

Let's dive right in.

1. Create a new directory for your project. (We'll call it `PROJECT` in this
   tutorial. Just replace `PROJECT` with the actual directory you're using.)

        mkdir PROJECT

2. Go into that directory:

        cd $PROJECT

3. And download FOAM into it:

        git clone https://github.com/foam-framework/foam.git

Your directory structure should look like this so far:

    PROJECT/
    |- foam/

FOAM is also available on `npm`, as `npm install foam-framework`. If you choose
that route, several of the links in this tutorial are going to be broken. You
can fix that by doing `mv node_modules/foam-framework foam` to get the same
structure shown above.

### Any Server Will Do

Note that FOAM web apps require no server support. FOAM web apps consist only of
static files, so any web server will work.

FOAM can also be used to build servers. Indeed, this tutorial includes sections
on creating a server and adding authentication to it.

### Browser Support

FOAM works in Chrome, Opera, Firefox, Safari, and IE11+. It works on Chrome for
Android, the Android WebView, and on iOS Safari.

### Development vs. Deployment

During development, you can reload the page to get the latest code. FOAM
includes scripts that will load the core FOAM files, and then load your app and
its dependencies on demand.

(You may have problems with caching. Most browsers' dev tools can disable caching.)


For production, FOAM includes a build tool that will produce an HTML file and
single Javascript file, containing your app and only those parts of the FOAM
codebase your app actually uses.

For this tutorial, we'll use the development mode. A guide to using the
build tool is coming soon. In the meantime, there are [several](https://github.com/foam-framework/foam/blob/master/apps/mbug/build.sh) [scripts](https://github.com/foam-framework/foam/blob/master/apps/todo/build.sh) that give an idea of how to use it.

### Loading FOAM for the first time

The final version of the tutorial app we're about to build lives in the FOAM
repository as a demo. Let's load it up now, and see where we'll be going.

FOAM includes a generic `index.html` page that will load any model you specify
in its `model_` parameter. See [here]({{ site.baseurl }}/guides/index_html) for
more details.

From the `PROJECT` directory, let's start our web server:

    python -m SimpleHTTPServer    # Python 2
    python -m http.server         # Python 3

Just leave that server running throughout the tutorial.

Now your `PROJECT` directory is served from `http://localhost:8000/`.

The app is a fairly basic Todo list. You can create new Todo items with the red
+ button. Tap a Todo to edit it. It supports search-as-you-type and more.

![List view screenshot]({{ site.url }}/tutorial/todo/assets/final-list.png)
![Detail view screenshot]({{ site.url }}/tutorial/todo/assets/final-details.png)

On a desktop-sized browser, it splits into multiple columns. On mobile (or a
narrow desktop window) it has a single column.

Go to [http://localhost:8000/foam/index.html?model\_=foam.tutorials.todo.TodoApp](http://localhost:8000/foam/index.html?model\_=foam.tutorials.todo.TodoApp) to see it in action.


## Next

We'll introduce a few of FOAM's key concepts in
[Part 1: Models and Metaprogramming]({{ site.baseurl }}/tutorial/todo/1-model/).

