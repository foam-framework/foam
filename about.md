---
layout: page
title: About
permalink: /about/
---

FOAM stands for Feature-Oriented Active Modeler. That isn't a very transparent name, so let's break it down:

- FOAM is a Javascript metaprogramming framework.
- It is **deeply** MVC. Everything is modeled:
    - Your data objects, obviously, but also:
    - The properties, methods, listeners, etc. on those objects
    - The properties etc. on *those* properties
    - Views
    - Controllers
    - `Model` itself!
- This modeled data is "smart":
    - It knows which properties should be displayed in a table, which are public keys, which should be hidden in the UI, and which to not store in the database.
    - It knows what to update when values change, how to validate incoming updates to their values, what view they should be rendered with.
    - Therefore databases and views don't need to be customized for your data - they already know how to handle it.
- FOAM has a simple, universal interface for data storage and querying called the DAO (Data Access Object). It has implementations for the web (LocalStorage, IndexedDB), NodeJS (MongoDB, XML and JSON flat files), a fast in-memory version, bridging over the network, etc.
- Likewise, views have a universal interface, and so views target the DOM, or a 2d Canvas. More targets can easily be added if there were a need - node-curses, 3d canvas, and more.

