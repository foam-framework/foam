# FOAM Concept: DAO (Data Access Object)

## What is a DAO?

A **DAO (Data Access Object)** in FOAM is an abstraction for a collection of data. It provides a standardized way to create, retrieve, update, and delete (CRUD) objects, regardless of where the data is actually stored. The data could be in memory, in the browser's `localStorage` or `IndexedDB`, or on a remote server accessible via a REST API.

The DAO is one of the most powerful concepts in FOAM. It allows you to write your application logic without having to worry about the details of data storage and retrieval.

## The DAO Interface

All DAOs implement a common interface, which includes the following methods:

*   `put(obj, sink)`: Adds a new object or updates an existing one.
*   `remove(query, sink)`: Removes an object.
*   `find(key, sink)`: Finds a single object by its primary key.
*   `select(sink, options)`: Retrieves a collection of objects.
*   `listen(sink, options)`: Subscribes to changes in the DAO. The `sink` will be notified whenever an object is added, updated, or removed.

## Sinks

DAO operations are asynchronous. Instead of returning data directly, they take a `sink` object as an argument. The `sink` is a callback object with methods that are called with the results of the operation:

*   `put(obj)`: Called for each object that is retrieved.
*   `remove(obj)`: Called when an object is removed.
*   `eof()`: Called when all data has been sent.
*   `error()`: Called if an error occurs.

## Chaining and Decorating

DAOs are designed to be decorated and chained together. This is a powerful feature that allows you to compose complex data operations from simpler ones.

For example, you can take a base DAO and add filtering, sorting, and pagination by chaining calls to `where()`, `orderBy()`, `skip()`, and `limit()`:

```javascript
var myDAO = IDBDAO.create({model: 'Todo'});

var filteredAndSortedDAO = myDAO
  .where(EQ(Todo.COMPLETED, false)) // Only show incomplete todos
  .orderBy(DESC(Todo.CREATION_TIME)) // Sort by creation time, descending
  .skip(10) // Skip the first 10 results
  .limit(20); // Show a maximum of 20 results

filteredAndSortedDAO.select({
  put: function(todo) {
    console.log('Found a todo:', todo.text);
  }
});
```

Each of these methods (`where`, `orderBy`, etc.) returns a new DAO that wraps the original, adding the specified functionality. This is an example of the Decorator design pattern.

## Common DAO Implementations

FOAM provides several built-in DAO implementations:

*   **`MDAO`**: An in-memory DAO that stores data in a JavaScript array.
*   **`IDBDAO`**: A DAO that persists data in the browser's IndexedDB.
*   **`StorageDAO`**: A DAO that persists data in `localStorage`.
*   **`RestDAO`**: A DAO that communicates with a remote server via a REST API.
*   **`CachingDAO`**: A decorator that adds caching to another DAO. It can be used to cache data from a remote server in memory or in `IndexedDB`.
*   **`SeqNoDAO`**: A decorator that automatically assigns sequential IDs to new objects.

You can also treat a standard JavaScript **`Array`** as a DAO, as the DAO methods are added to the `Array.prototype`. This is very convenient for testing and for working with small, in-memory collections of data.
