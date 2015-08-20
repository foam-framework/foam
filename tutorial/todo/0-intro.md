---
layout: tutorial-todo
permalink: /tutorial/todo/0-intro/
tutorial: 0
---

## Overview

FOAM is several things: a metaprogramming framework, a Javascript MVC library, a
collection of Views, and more.

The single thread uniting FOAM is the desire to work at a higher level: of
abstraction, of productivity, and of performance. The
[About page]({{ site.baseurl }}/about/) has more information about FOAM's
philosophy.

This tutorial is a hands-on introduction to how FOAM can help you build
*fast apps fast*.

## Audience

You should be at least somewhat familiar with Javascript and build apps for the
web. You definitely don't need to be an expert. No familiarity with FOAM is
assumed: we're starting from scratch here.

## Required Tools

You'll need `git` and a local web server. We suggest Python's built-in web
server module, which is easy to use and probably already installed.

## Getting Started

Let's dive right in: create a new directory for your project, and download FOAM
into it:

    mkdir $PROJECT
    cd $PROJECT
    git clone https://github.com/foam-framework/foam.git

Now you've got a subdirectory, `foam/`, containing the framework.

FOAM is also available on `npm`, as `npm install foam-framework`.

Note that, while FOAM can be used to build Node.js servers and tools, the web
side of FOAM requires no server support. Any app you build will consist of
static files that can be served by any app.

FOAM web apps can be loaded in two ways:

- For development, directly from the separate files.
- For production, FOAM includes a build tool that will include only the parts
  of FOAM that your app actually uses, and combine them into a single, minified
  file.

For most of this tutorial, we'll use the development mode. A guide to using the
build tool is coming soon. In the meantime, there are [several](https://github.com/foam-framework/foam/blob/master/apps/mbug/build.sh) [scripts](https://github.com/foam-framework/foam/blob/master/apps/todo/build.sh) that give an idea of how to use it.

### Loading FOAM for the first time

The final version of the tutorial app we're about to build lives in the FOAM
repository as a demo. Let's load it up now, and see where we'll be going.

You can see it live on Github [here]({{ site.url }}/foam/index.html?model=foam.tutorials.todo.TodoApp).

FOAM includes a generic `index.html` page that will load FOAM and then load any
model specified in the query parameters. We'll use that to load the demo app.

From the $PROJECT directory, let's start our web server:

    python -m SimpleHTTPServer    # Python 2
    python -m http.server         # Python 3

Now the $PROJECT directory is served from [http://localhost:8000/](http://localhost:8000/).

To view the Todo app, go to [http://localhost:8000/index.html?model=foam.tutorials.todo.TodoApp](http://localhost:8000/index.html?model=foam.tutorials.todo.TodoApp).

You should be seeing something like this:

![List view screenshot]({{ site.url }}/tutorial/todo/assets/final-list.png)
![Detail view screenshot]({{ site.url }}/tutorial/todo/assets/final-details.png)

Try it out! The app is a fairly basic Todo list. You can create new Todo items
with the red + button, edit existing Todos, search-as-you-type, and more. On
desktop, it can split into multiple columns. On mobile, it will be a single
column.

We'll get started building our app in [Part 1: Todo Model]({{ site.baseurl }}/tutorial/todo/1-model/).

