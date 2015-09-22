This demo shows FOAM's ability to perform high-performance reciprocal search, and it's ability to transparently work with either local or remote data-sources (DAO's).

Controller.js contains a standalone model that stores data locally. It can be run at at []().

ClientController.js contains a Client version of the model which connects to the server supplied in Server.js.

From the top level foam directory, run the server with:

    node --harmony tools/foam.js foam.node.tools.Server agents=foam.demos.olympics.Server

Then run the client by connecting to

    [http://localhost:8080/index.html?model=foam.demos.olympics.ClientController](http://localhost:8080/index.html?model=foam.demos.olympics.ClientController)
