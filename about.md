---
layout: page
title: About
permalink: /about/
---

We fundamentally believe in programming at a higher level - of abstraction, productivity, and performance.

Therefore FOAM is a _meta_-programming framework.
It is reactive and highly declarative - you specify the properties on objects, and how they react when their values change.
Very little code is left to be written in an imperative style - mostly event handlers that update a few properties.

FOAM stands for **Feature-Oriented Active Modeler**. That isn't a very transparent name, so let's break it down.

- FOAM is **deeply** MVC. Everything is modeled:
    - Your data objects, obviously, but also:
    - The properties, methods, listeners, etc. on those objects
    - The properties etc. on *those* properties
    - Views
    - Controllers
    - `Model` itself!
- This modeled data is "smart":
    - It knows which properties should be displayed in a table, which are public keys, which should be hidden in the UI, and which not to store in the database.
    - It knows what to update when values change, how to validate incoming updates to those values, what view the values should be rendered with.
    - Therefore databases and views don't need to be customized for your data - they already know how to handle it.
- FOAM has a simple, universal interface for data storage and querying called the DAO (Data Access Object). There are many implementations:
    - LocalStorage and IndexedDB for the web.
    - MongoDB, and XML and JSON flat files for Node.js
    - A blazing-fast in-memory implementation that can build indexes automatically and on the fly.
    - Decorator DAOs that make it easy to layer DAOs as caches on top of others.
        - Layer memory atop IndexedDB atop the network in one line!
- Likewise, views have a universal interface, and so views target the DOM, or a 2d Canvas. More targets can easily be added if there were a need - node-curses, 3d canvas, and more.

