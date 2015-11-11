This is the Offline Web.

## Clienty only / fake server setup

Set `Client.clientServer` to the value of `Client.fakeInternalServer`.

Serve FOAM from `localhost:8000`.

Run the client by connecting to [http://localhost:8000/index.html?model=com.google.ow.Client&view=com.google.ow.Browser].

## Client-server setup

Set `Client.clientServer` to the value of `Client.realClient`.

From the top level foam directory, run the server with:

    node --harmony tools/foam.js foam.node.Server port=8080 agents=com.google.ow.Server

Run the client by connecting to [http://localhost:8080/index.html?model=com.google.ow.Client&view=com.google.ow.Browser].
