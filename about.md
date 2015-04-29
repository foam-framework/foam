---
layout: page
title: About
permalink: /about/
---

The basic principle of FOAM is **fast apps fast**.

FOAM is composed of tools to help you quickly write an app that loads and runs
fast, on desktop and mobile.

Our main goal is to do as much as possible with each chunk of code. The fastest,
most secure, and least buggy code in your app is the code that isn't there.

FOAM is a _meta_-programming framework. It is very declarative and reactive,
because that's a very high-level way of expressing how the app should work.


- FOAM is **deeply MVC**. Everything flows from the Model. The Model is how your
  app views the world. What entities are there? What do we know about
  those entities? What things can we do to those entities?
    - FOAM contains a very advanced class system. An object contains properties
      and methods, yes. But also user actions, view templates, i18n strings, and
      more.
        - Actions know reactively when to be disabled or hidden.
        - Properties have types, but also factories, default values, `postSet`
          handlers, a default view, and much more.
- FOAM is **reusable** and **composable**. It has many reusable view components,
  but also reusable data storage (see below) and reusable controllers.
- FOAM is **reactive**. It's easy to wire together views so everything updates
  when it should.
    - FOAM is reactive, cross-browser and **fast**. But dirty checking scales
      badly and `Object.observe` isn't cross-browser! [Performance]({{ site.baseurl }}/performance)
      explains how we do it.
- [**Data** is better than code]({{ site.baseurl }}/principles). **Smart data** is even better. FOAM objects are
  reflective: they know what properties they have and we can generate
  serialization code for JSON, XML and more formats. They can intelligently
  compare and diff, figure out how best to be stored on different databases,
  and much more.
    - FOAM objects and their properties are themselves described as FOAM objects. See [Model]({{ site.baseurl }}/foam/apps/docs/docbrowser.html#Model) and [Property]({{ site.baseurl }}/foam/apps/docs/docbrowser.html#Model).
    - FOAM is "written in itself", using the same metaprogramming power offered
      to users. That keeps it compact, and loading fast.
- [**Interfaces** are better than implementations]({{ site.baseurl }}/principles). FOAM has a standard interface
  for data storage (see below) and for views (DOM, 2D canvas, and more).
    - Need something we don't provide? Write a new implementation that is just
      as powerful as the ones that come standard.
- FOAM has a universal interface, the DAO or Data Access Object, for storing
  data without worrying about the details. It comes with many DAO
  implementations:
    - For the web: IndexedDB and LocalStorage
    - For Node.js: MongoDB, XML files and JSON files.
    - For Google Compute Engine: Cloud Datastore (from Node.js)
    - For everywhere: A blazing-fast in-memory implementation.
        - Automatically builds indexes on the fly, and makes search-as-you-type easy.
    - Decorator DAOs that add extra functionality to others: logging, timing,
      several caching strategies.
        - Layer a memory cache atop IndexedDB atop the network in one line!
        - Swap your real stack for an array of test data, without changing or
          mocking anything.

