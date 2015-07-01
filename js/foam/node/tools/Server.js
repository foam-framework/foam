CLASS({
  package: 'foam.node.tools',
  name: 'Server',
  requires: [
    'foam.node.server.NodeServer',
    'foam.node.server.DAOHandler',
    'foam.node.server.StaticFileHandler',
    'MDAO'
  ],
  properties: [
    {
      model_: 'IntProperty',
      name: 'port',
      adapt: function(_, v) {
        if ( typeof v === "string" ) return parseInt(v);
        return v;
      },
      defaultValue: 8080
    },
    {
      model_: 'StringProperty',
      name: 'filepath'
    },
    {
      name: 'dao',
      factory: function() {
        return this.MDAO.create({
          model: Model
        });
      }
    },
    {
      name: 'server',
      factory: function() {
        console.log("boot dir is: ", global.FOAM_BOOT_DIR);

        return this.NodeServer.create({
          port: this.port,
          handlers: [
            this.DAOHandler.create({
              daoMap: {
                'ModelDAO': this.dao
              }
            }),
            this.StaticFileHandler.create({
              dir: global.FOAM_BOOT_DIR,
              prefix: '/core/'
            }),
            this.StaticFileHandler.create({
              dir: global.FOAM_BOOT_DIR + '/../js/',
              prefix: '/js/'
            })
          ]
        });
      }
    }
  ],
  methods: [
    function execute() {
      this.server.launch();
    }
  ]
});
