# FOAM Concept: Model

## What is a Model?

In FOAM, a **Model** is a blueprint for creating objects. It's similar to a class in other object-oriented programming languages. You define a model to describe the structure and behavior of a certain type of object in your application.

Models are defined using the `MODEL()` function, which takes a JavaScript object (a map) as its argument. This object describes the model's characteristics, such as its name, the properties it has, and the methods it can perform.

## Core Ideas

*   **Meta-Programming:** FOAM uses a meta-programming approach. You don't write classes directly in JavaScript. Instead, you create models, which are then used by the FOAM framework to generate the actual JavaScript prototypes (classes) at runtime. This allows you to work at a higher level of abstraction.

*   **Declarative:** You declare the structure of your objects. For example, you list the properties an object should have, and FOAM takes care of creating the getters, setters, and other boilerplate code.

*   **Inheritance and Composition:** Models support single inheritance through the `extendsModel` property and multiple inheritance/composition through `traits`. This allows for code reuse and building complex objects from simpler parts.

## Example of a Model Definition

```javascript
MODEL({
  name: 'Todo',

  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'completed',
      type: 'Boolean',
      view: 'foam.ui.md.CheckboxView',
      defaultValue: false
    },
    {
      name: 'text',
      type: 'String',
      view: 'foam.ui.md.TextFieldView',
      displayWidth: 50
    }
  ],

  actions: [
    {
      name: 'save',
      isAvailable: function() { ... },
      code: function() { ... }
    }
  ]
});
```

In this example:
*   `name`: Defines the name of the model, `Todo`.
*   `properties`: An array of property definitions. Each property has a name, a type, and can have other attributes like a default value or a specific view to use for rendering.
*   `actions`: An array of actions the object can perform. Actions are similar to methods but have extra features like being able to be enabled or disabled.

## How it Works Under the Hood

When you define a model, FOAM's `ModelProto` object takes that definition and:
1.  **Builds a Prototype:** It creates a JavaScript prototype for your new "class".
2.  **Handles Inheritance:** If you use `extendsModel`, it sets up the prototype chain to inherit from the parent model.
3.  **Applies Traits:** It mixes in any specified `traits`.
4.  **Adds Properties:** It defines the properties on the prototype, creating getters and setters.
5.  **Adds Methods and Actions:** It adds the methods and actions you've defined to the prototype.

This all happens automatically, letting you focus on defining your application's data and logic rather than writing boilerplate code.
