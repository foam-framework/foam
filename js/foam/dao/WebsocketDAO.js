/* global CLASS */
/* global JSONUtil */
/* global io */
CLASS({
  package: 'foam.dao',
  name: 'WebsocketDAO',
  extendsModel: 'foam.dao.EasyClientDAO',
  requires: [
    'XHR',
    'foam.core.dao.ClientDAO',
  ],

  methods: [
    function forward(socket, messageName) {
      var self = this;
      socket.on(messageName, function(args) {
        // TODO: a nicer way to do this?
        var a = JSONUtil.parse(self.X, args[0]);
        if (a.model_.name == self.model.name) {
          console.log("Received a " + messageName + " message, and called notify_");
          self.notify_(messageName, args);
        } else {
          console.log("Ignored incoming " + messageName
          + " a.model is " + a.model_.name + " which is a " + typeof a.model_.name
          + " and self.model is " + self.model.name + " which is a " + typeof self.model.name);
        }
      });
    },
    function init() {
      this.SUPER();
      
      var socket = io.connect();
      
      this.forward(socket, 'put');
      this.forward(socket, 'remove');
      this.forward(socket, 'reset');
    },
  ]
});