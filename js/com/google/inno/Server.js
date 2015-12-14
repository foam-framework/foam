CLASS({
  package: 'com.google.inno',
  name: 'Server',
  requires: [
    'foam.dao.EasyDAO',
    'com.google.inno.Message'
  ],
  imports: [
    'exportDAO'
  ],
  properties: [
    {
      name: 'messageDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          model: this.Message,
          isServer: true,
          guid: true,
          contextualize: true,
          cloning: true
        });
      }
    }
  ],
  methods: [
    function execute() {
      this.exportDAO(this.messageDAO);
    }
  ]
});
