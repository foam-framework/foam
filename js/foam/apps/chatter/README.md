This app is a simple multi-client single server chat system.  It shows FOAM's ability to synchronize collections of objects (DAOs) across multiple machines.

From the top level foam directory, run the server with:

    node --harmony tools/foam.js foam.node2.Server agents=foam.apps.chatter.Server

Then run the client by connecting to [http://localhost:8080/index.html?model=foam.apps.chatter.Client&view=foam.apps.chatter.ClientView](http://localhost:8080/index.html?model=foam.apps.chatter.Client&view=foam.apps.chatter.ClientView)
