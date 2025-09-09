# FOAM: Zero to Hero

Welcome to FOAM! This guide is designed to take you from a complete beginner to a productive FOAM developer. We'll cover the core concepts, walk you through setting up your environment, and help you build your first FOAM application.

FOAM (Feature Oriented Active Modeller) is a powerful, full-stack, meta-programming framework for building web applications. It's designed to help you write less code, build more features, and create high-performance applications.

This guide will demystify FOAM and show you how its unique, model-driven approach can help you be a more productive developer. Let's get started!

## Why FOAM?

Before we dive into the code, let's talk about why FOAM is a framework worth learning. FOAM is different from many other web frameworks. It's built on a few core principles that, once you understand them, can dramatically increase your productivity and the quality of your applications.

### 1. Model-Driven Development

The core of FOAM is its **model-driven** approach. Instead of writing classes in JavaScript, you define **Models**. A model is a high-level description of an object's properties and behavior.

**The "A-ha!" Moment:** You declare what your data looks like, and FOAM writes the boilerplate code for you.

For example, you can define a `Todo` model like this:

```javascript
MODEL({
  name: 'Todo',
  properties: [
    { name: 'id' },
    { name: 'completed', type: 'Boolean' },
    { name: 'text', type: 'String' }
  ]
});
```

From this simple definition, FOAM will automatically create a `Todo` class with getters, setters, and event listeners for each property. This means you can write less code and focus on your application's logic.

### 2. Don't Repeat Yourself (DRY)

FOAM takes the DRY principle to a new level. Because you define so much of your application's structure in your models, you can reuse that information everywhere.

**The "A-ha!" Moment:** Define it once, use it everywhere.

For example, a property definition can include not just a name and a type, but also a `label`, `help` text, validation rules, and a default `view`.

```javascript
{
  name: 'text',
  type: 'String',
  label: 'Todo Item',
  help: 'The text of the todo item.',
  view: 'TextFieldView'
}
```

The framework can then use this metadata to:
*   Generate a database schema.
*   Create a form with the correct input fields and labels.
*   Display help text or tooltips.
*   Validate user input.

You don't have to write separate code for each of these concerns.

### 3. Reactive Programming

FOAM is a **reactive** framework. This means that the UI automatically updates when the underlying data changes.

**The "A-ha!" Moment:** Your UI is always a reflection of your data, without any manual DOM manipulation.

You bind views to your data, and FOAM takes care of the rest. For example, in the TodoMVC demo, the list of todos, the "items left" count, and the "Clear completed" button all update automatically as you add, complete, and delete todos. This is achieved through FOAM's powerful event and data-binding system.

### 4. Pluggable Architecture with DAOs

FOAM's **Data Access Objects (DAOs)** provide a consistent API for working with collections of data, regardless of where that data is stored.

**The "A-ha!" Moment:** You can swap out your data storage backend without changing your application code.

You can start with an in-memory `MDAO` for rapid prototyping, then switch to a `StorageDAO` (for `localStorage`) or an `IDBDAO` (for `IndexedDB`) for persistence in the browser, or even a `RestDAO` to connect to a remote server. The code that uses the DAO doesn't need to change.

DAOs are also highly composable. You can chain them together to add caching, filtering, sorting, and other features.

By embracing these core concepts, FOAM allows you to build complex, high-performance applications with surprisingly little code.

## Getting Started: Your First FOAM App

Now that you understand the "why", let's get our hands dirty and build a simple FOAM application. We'll walk through the process of setting up your environment and creating a basic "Hello, World!" style app.

### 1. Set Up Your Project

First, you'll need to get the FOAM source code and set up a project directory.

1.  **Create a project directory:**
    ```bash
    mkdir my-foam-app
    cd my-foam-app
    ```

2.  **Clone the FOAM repository:**
    ```bash
    git clone https://github.com/foam-framework/foam.git
    ```
    This will download the FOAM framework into a `foam/` subdirectory. Your project structure should look like this:
    ```
    my-foam-app/
    └── foam/
    ```

### 2. Start a Local Web Server

FOAM applications are just collections of static files, so you don't need a complex server-side setup. Any simple web server will do. If you have Python installed, you can use its built-in web server.

From your project's root directory (`my-foam-app`), run one of the following commands:

**For Python 3:**
```bash
python -m http.server
```

**For Python 2:**
```bash
python -m SimpleHTTPServer
```

If you don't have Python, you can use any other simple web server, such as the `http-server` package from npm (`npm install -g http-server` and then run `http-server`).

Once the server is running, you should be able to access your project at `http://localhost:8000`.

### 3. Create your Application File

Now, let's create the files for our application. We'll need an HTML file and a JavaScript file.

Create a new file called `index.html` in your `my-foam-app` directory with the following content:

```html
<!-- my-foam-app/index.html -->
<html>
  <head>
    <title>My First FOAM App</title>
    <script src="foam/core/bootFOAM.js"></script>
    <script src="app.js"></script>
  </head>
  <body>
    <foam model="AppController"></foam>
  </body>
</html>
```

This HTML file does three things:
1.  Loads the FOAM framework (`bootFOAM.js`).
2.  Loads our application's JavaScript file (`app.js`).
3.  Includes a `<foam>` tag to tell FOAM to create an instance of our `AppController` model when the page loads.

Next, create a file called `app.js` in the `my-foam-app` directory:

```javascript
// my-foam-app/app.js
MODEL({
  name: 'AppController',

  properties: [
    {
      name: 'name',
      type: 'String',
      label: 'Enter your name:',
      view: 'TextFieldView',
      defaultValue: 'World'
    }
  ],

  templates: [
    {
      name: 'toDetailHTML',
      template: '<h1>Hello, $$name{mode: "read-only"}!</h1>$$name'
    }
  ]
});
```

This is our entire application! Let's break it down:
*   We define a `MODEL` called `AppController`.
*   It has one `property` called `name`.
    *   We give it a `label` to be displayed in the UI.
    *   We specify that its `view` should be a `TextFieldView`.
    *   We give it a `defaultValue` of "World".
*   It has one `template` called `toDetailHTML`. This template defines how the `AppController` will be rendered.
    *   `<h1>Hello, $$name{mode: "read-only"}!</h1>`: This line displays a heading. The `$$name{mode: "read-only"}` part is a special FOAM syntax that creates a read-only view of the `name` property. This view will automatically update whenever the `name` property changes.
    *   `$$name`: This creates the default view for the `name` property, which is a `TextFieldView` as we specified in the property definition.

### 4. Run your Application

Save both files and navigate to `http://localhost:8000/index.html` in your browser. You should see your application!

You'll see a heading that says "Hello, World!" and a text input field with "World" in it. Try typing your name into the input field. As you type, you'll see the heading update in real-time.

**Congratulations! You've just built your first FOAM application.**

You've seen how to:
*   Define a model with properties.
*   Use views to display data and handle user input.
*   Use templates to define the structure of your UI.
*   Take advantage of FOAM's reactive data binding to create a dynamic application with very little code.

This simple example just scratches the surface of what FOAM can do. You can now explore the `demos/` directory in the FOAM repository to see more complex examples, and refer to the `CONCEPT_*.md` files you've created to deepen your understanding of the core concepts.
