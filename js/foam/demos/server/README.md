Simple Client/Server version of TodoMVC example.

Run Server:

    nodejs tools/foam.js foam.node.tools.Server configModel=foam.demos.server.TodoServerConfig

Client:

    http://localhost:8888/index.html?model=foam.demos.server.TodoClient

Data is written to Todos.json, relative to where you launch the server from.