CLASS({
  name: 'Client',
  package: 'foam.demos.serverdaobreak',
  requires: [
    'foam.demos.serverdaobreak.SomeModel',
    'foam.dao.EasyDAO',
  ],
  properties: [
    {
      name: 'dao',
      model_: 'foam.core.types.DAOProperty',
      view: 'foam.ui.SimpleDAOController',
      lazyFactory: function() {
        return this.EasyDAO.create({
          autoIndex: true,
          cache: true,
          cloning: true,
          contextualize: true,
          daoType: 'MDAO',
          dedup: true,
          guid: true,
          model: this.SomeModel,
          serverUri: 'http://localhost:8081/api',
          sockets: true,
          syncWithServer: true,
        });
      },
    },
    {
      name: 'numRowsToPut',
      type: 'Int',
      defaultValue: 10000,
    }, 
  ],
  actions: [
    {
      name: 'putRows',
      code: function() {
        var randomString = function() {
          return Math.random().toString(36).substring(10);
        };
        for ( var i = 0; i < this.numRowsToPut; i++ ) {
          this.dao.put(this.SomeModel.create({
            from: i,
            body: randomString(),
            subject: randomString(),
          }));
        }
      },
    },
  ],
});
