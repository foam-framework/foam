# FOAM Concept: View

## What is a View?

In FOAM, a **View** is a component that displays data and interacts with the user. Views are the building blocks of the user interface in a FOAM application. They are responsible for rendering HTML and handling user input.

Like other parts of FOAM, Views are defined as [Models](CONCEPT_MODEL.md). The base `View` model provides the core functionality that all UI components share.

## Core Ideas

*   **Data-Driven:** Views are designed to be data-driven. They are typically bound to a [Property](CONCEPT_PROPERTY.md) of a model instance or to a [DAO](CONCEPT_DAO.md). When the underlying data changes, the view automatically updates to reflect the new state.

*   **Reusability:** FOAM provides a library of common views that you can reuse in your applications, such as text fields, checkboxes, and buttons. You can also create your own custom views by extending the base `View` model.

*   **Automatic UI Generation:** Because properties have rich metadata (including a `view` attribute), the FOAM framework can often generate a user interface for a model automatically. For example, a `DetailView` can take a model instance and render a form with the correct input fields for each property.

*   **HTML and DOM:** Views have a `toHTML()` method that generates their HTML representation. After the HTML is inserted into the DOM, an `initHTML()` method is called to attach event listeners and set up data binding.

## Data Binding in Views

Data binding is a key feature of FOAM views. It's the process of connecting a view's display to the application's data.

*   **`value` and `data` properties:** Views typically have a `value` or `data` property that holds the data they are displaying. This is often a `SimpleValue` or a `Property` of another object.
*   **`Events.link` and `Events.follow`:** FOAM provides utility functions for setting up data binding. `Events.link()` creates a two-way binding, where changes in the view update the model and changes in the model update the view. `Events.follow()` creates a one-way binding.

## Example of a View

Here's an example of how you might use a `TextFieldView` in a template:

```html
<!-- In your HTML file -->
<foam model="Todo" view="DetailView"></foam>
```

```javascript
// In your JavaScript file
MODEL({
  name: 'Todo',
  properties: [
    {
      name: 'text',
      type: 'String',
      // This tells FOAM to use a TextFieldView for this property
      view: 'TextFieldView'
    }
  ]
});

MODEL({
  name: 'DetailView',
  extendsModel: 'View',
  // ... implementation of DetailView ...
});
```

In this example, the `DetailView` would be responsible for rendering the `Todo` model. When it encounters the `text` property, it would see that the `view` is set to `TextFieldView` and would instantiate a `TextFieldView` to handle the display and editing of that property.

## Common Views

FOAM comes with a set of pre-built views for common UI elements:

*   `TextFieldView`: A single-line text input.
*   `TextAreaView`: A multi-line text area.
*   `BooleanView`: A checkbox.
*   `ChoiceView`: A dropdown select box.
*   `DAOListView`: A view for displaying a list of items from a DAO.
*   `DetailView`: A view that displays a form for editing a single model instance.
*   `ActionButton`: A button that is linked to an `Action` on a model.
