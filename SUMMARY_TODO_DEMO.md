# Summary of the FOAM TodoMVC Demo

This document summarizes the architecture and key concepts of the FOAM TodoMVC demo application, found in `apps/todo/`.

## Overview

The TodoMVC demo is a complete, self-contained application that showcases the power and elegance of the FOAM framework. It's built using a set of interconnected models that handle the data, view, and controller logic. The entire application is defined in `Todo.js` and loaded into a simple `Todo.html` file.

## Key Components

The application is built around three main models:

1.  **`Todo`**: This is the data model for a single todo item.
2.  **`TodoDAO`**: This is a decorator for the main DAO that adds some custom logic.
3.  **`Controller`**: This is the main application controller that ties everything together.

### The `Todo` Model

*   **Properties:** The `Todo` model has three properties: `id`, `completed` (a boolean), and `text` (a string).
*   **View Template:** It defines a `toDetailHTML` template that specifies how a single todo item should be rendered in the list. This template uses the `$$` syntax to create views for the `completed` and `text` properties, which automatically binds them to the data.
*   **Event Handling:** The template also includes event handlers for user interactions, such as clicking the "destroy" button and double-clicking to edit a todo.

### The `TodoDAO` Model

*   **Decorator:** This model is a `ProxyDAO` that wraps another DAO. This is a common pattern in FOAM for adding functionality to a DAO without modifying the original.
*   **Custom Logic:** It overrides the `put` method to prevent users from adding todos with empty text. If the text is empty, it removes the item instead.

### The `Controller` Model

The `Controller` model is the heart of the application.

*   **Properties as State:** It uses properties to manage the application's state, including:
    *   `input`: The main input field for adding new todos.
    *   `dao`: The main data store for the application.
    *   `filteredDAO`: A "live" view of the `dao` that is filtered based on the current `query`.
    *   `completedCount` and `activeCount`: Properties that are automatically updated to reflect the number of completed and active todos.
    *   `query`: A property that is bound to a `ChoiceListView` (a set of radio buttons) to control the filtering.
*   **Reactive Programming:** The `Controller` demonstrates reactive programming principles. For example, when the `query` property changes, the `postSet` listener automatically updates the `filteredDAO` property. This, in turn, causes the `DAOListView` that is displaying the todos to update automatically.
*   **Actions:** It defines a `clear` action for removing all completed items. The action has a dynamic `labelFn` and an `isEnabled` function, which automatically update the button's text and enabled state based on the `completedCount`.
*   **Initialization:** The `init` method sets up the DAO stack. It uses `EasyDAO` to create a `StorageDAO` (which uses `localStorage` for persistence) and wraps it with the `TodoDAO` decorator.
*   **Main View:** The `toDetailHTML` template on the `Controller` model defines the overall HTML structure of the application. It uses the `$$` syntax to embed views for its properties, such as the input field, the list of todos, and the footer controls.

## How it's Loaded

The `Todo.html` file is very simple.
1.  It loads the FOAM framework (`bootFOAM.js`).
2.  It loads the application code (`Todo.js`).
3.  It uses a single `<foam>` tag to instantiate the `Controller` model:
    `<foam id="todo" model="Controller"></foam>`

When the page loads, FOAM's `DOM.init()` function finds this tag and automatically creates an instance of the `Controller` model, which then renders the entire application.

## Key FOAM Concepts Demonstrated

*   **Modeling:** The application is defined declaratively using models.
*   **Properties:** Properties are used to define the data structure and application state.
*   **Views:** Views are used to create the UI, and they are automatically bound to the data.
*   **DAOs:** DAOs are used to manage the collection of todos, providing a clean separation between the application logic and the data storage.
*   **Templates:** Templates are used to define the HTML structure of the views.
*   **Actions:** Actions are used to define user-initiated operations.
*   **Reactive Programming:** The application is built around the idea of reactive properties that automatically update the UI when the data changes.
*   **Dependency Injection:** The `X` (context) object is used to pass dependencies, like the `memento` service for URL routing, to the views.
