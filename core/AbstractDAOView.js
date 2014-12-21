CLASS({
  name: 'AbstractDAOView',

  extendsModel: 'View',

  documentation: function() { /*
     <p>For $$DOC{ref:'View',usePlural:true} that take data items from a $$DOC{ref:'DAO'}
     and display them all, $$DOC{ref:'.'} provides the basic interface. Set or bind
     either $$DOC{ref:'.data'} or $$DOC{ref:'.dao'} to your source $$DOC{ref:'DAO'}.</p>
     <p>Call $$DOC{ref:'.onDAOUpdate'} to indicate a data change that should be
      re-rendered.</p>
  */},

  exports: ['dao$ as daoViewCurrentDAO$'],

  properties: [
    {
      name: 'data',
      postSet: function(oldDAO, dao) {
        if ( this.dao !== dao ) {
          this.dao = dao;
        }
      },
      documentation: function() { /*
          Sets the $$DOC{ref:'DAO'} to render items from. Use $$DOC{ref:'.data'}
          or $$DOC{ref:'.dao'} interchangeably.
      */}
    },
    {
      model_: 'DAOProperty',
      name: 'dao',
      label: 'DAO',
      help: 'An alias for the data property.',
      onDAOUpdate: 'onDAOUpdate',
      postSet: function(oldDAO, dao) {
        if (!dao) {
          this.data = "";
        } else if ( this.data !== dao ) {
          this.data = dao;
        }
      },
      documentation: function() { /*
          Sets the $$DOC{ref:'DAO'} to render items from. Use $$DOC{ref:'.data'}
          or $$DOC{ref:'.dao'} interchangeably.
      */}
    }
  ],

  methods: {
    onDAOUpdate: function() { /* Implement this $$DOC{ref:'Method'} in
          sub-models to respond to changes in $$DOC{ref:'.dao'}. */ }
  }
});
