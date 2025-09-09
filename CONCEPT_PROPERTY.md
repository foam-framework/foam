# FOAM Concept: Property

## What is a Property?

In FOAM, a **Property** defines a piece of data that belongs to a [Model](CONCEPT_MODEL.md). When you define a model, you give it an array of properties. Each property describes the name, type, and other characteristics of a field on the objects created from that model.

Just like everything else in FOAM, properties are themselves defined by a model. The `Property` model describes what attributes a property can have.

## Core Ideas

*   **Rich Metadata:** Properties are more than just a name and a type. They have a rich set of metadata that can be used by the framework to automate tasks. For example, the `view` attribute tells the framework which UI component to use to display the property, and the `help` attribute can be used to generate documentation or tooltips.

*   **Data-Binding and Reactivity:** Properties are the foundation of FOAM's reactive programming system. When a property's value changes, it can automatically trigger events, update views, and re-evaluate other properties that depend on it.

*   **Hooks and Custom Logic:** You can attach custom logic to properties using hooks like `preSet` (before the value is set) and `postSet` (after the value is set). You can also define custom `getter` and `setter` functions for full control over how the property's value is accessed and modified.

## Example of Property Definitions

```javascript
MODEL({
  name: 'Todo',
  properties: [
    // A simple boolean property with a default value and a specific view
    {
      name: 'completed',
      type: 'Boolean',
      view: 'foam.ui.md.CheckboxView',
      defaultValue: false
    },

    // A string property with a display width
    {
      name: 'text',
      type: 'String',
      view: 'foam.ui.md.TextFieldView',
      displayWidth: 50
    },

    // A property with a dynamic default value
    {
      name: 'creationTime',
      type: 'DateTime',
      factory: function() { return new Date(); }
    }
  ]
});
```

## Common Property Attributes

Here are some of the most common attributes you can use when defining a property:

*   `name`: The name of the property (required).
*   `type`: The data type (e.g., 'String', 'Int', 'Boolean', 'Date'). Defaults to 'String'.
*   `label`: A human-readable label for use in UIs.
*   `defaultValue`: A static default value for the property.
*   `defaultValueFn`: A function that returns a default value.
*   `factory`: A function that is called to create the initial value when a new object is instantiated.
*   `view`: The name of the View to use for this property in a user interface.
*   `hidden`: If `true`, the property will be hidden in UIs.
*   `required`: If `true`, the property must have a value.
*   `preSet`: A function that is called before a new value is set. It can be used to validate or modify the value.
*   `postSet`: A function that is called after a new value is set. It's often used to trigger events or update other parts of the application.
*   `help`: A string of help text that can be used for tooltips or documentation.

By defining these attributes, you provide the FOAM framework with the information it needs to automatically handle data validation, UI rendering, and other common tasks, which helps you write less boilerplate code.
