# FOAM TodoMVC Example

FOAM is a full-stack, reactive, deeply MVC, metaprogramming Javascript framework.

See the [main site](https://foam-framework.github.io/foam) for more information.


## Learning FOAM

The [FOAM site](https://foam-framework.github.io/foam) is the place to get started.

FOAM is alpha, rapidly evolving, and sparsely documented. What documentation there is can be found on the [site](https://foam-framework.github.io/foam), [About page](https://foam-framework.github.io/foam/about) and [Github repo](https://github.com/foam-framework/foam).

_If you have other helpful links to share, or find any of the links above no longer work, please [let us know](https://github.com/tastejs/todomvc/issues)._


## Implementation

The main pieces here are the `Todo` model and the controller. Both have a template - for an individual row, and for the whole page, respectively.

The `Controller` is the central point of coordination for the app. It has several different reactive pieces.
- It has a property, `input`, which is bound to the new todo input box. When the user presses enter, the value from the DOM element is written to `input`, and its `postSet` will fire, adding the new `Todo` to the database.
- `dao` is the unfiltered database of all `Todo`s.
- `filteredDAO` is a filtered view onto that database. Which filter is controlled by `query`.
- The `view` property for `query` determines the appearance and behavior of the All-Active-Completed buttons.
- The one `action` is attached to the `Clear Completed` button.
- A listener, `onDAOUpdate`, fires whenever the underlying data updates. It causes the list to re-render.

Of particular interest is the line which begins

    this.filteredDAO = this.dao = TodoDAO.create({

`TodoDAO` is a simple wrapper that ensures an entry which is edited to be empty gets removed.
Its `delegate` is the underlying DAO, which here is an `EasyDAO`. `EasyDAO` is a facade that makes it easy to construct common storage patterns:
- `model` defines the type of data we're storing, here a `Todo.
- `seqNo: true` means that `Todo`'s `id` property will be auto-incremented.
- `daoType: 'StorageDAO'` means our DAO is backed by LocalStorage.
- `EasyDAO` by default caches any DAO that isn't in-memory. This means that the entire LocalStorage contents are loading into the cache at startup, and all updates are written through to memory and LocalStorage.

### Deviations from the Spec

The only known deviation is that routing is not supported. There are plans to add routing support, but it has not become a priority yet.

## Running

The only step needed to get the example working is `bower install`.

To run the app, spin up an HTTP server and visit `http://localhost:8000/Todo.html`.


## Credit

This TodoMVC application was created by the [FOAM team](https://github.com/orgs/foam-framework/members) at Google Waterloo.
