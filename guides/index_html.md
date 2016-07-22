---
layout: page
title: Index.html Launcher Guide
permalink: /guides/index_html/
---

## Clone repository
First, clone the FOAM repository into a directory of your choice or
use the default ```foam``` directory.

e.g.
```
git clone https://github.com/foam-framework/foam.git
```

## Http Server

From within the root of the FOAM repository, start your HTTP server.

e.g.
```
cd foam
python -m SimpleHTTPServer    # Python 2
python -m http.server         # Python 3
```

## Pass the model as query parameter to index.html

The default behavior of the root ```index.html``` is to display a sample project.

By providing the model parameter, the model is processed and the
associated UI is presented.

Notice the parameter is ```model```.

e.g.
```
http://localhost:8000/index.html?model=foam.flow.FOAMByExample
```

