CLASS({
  package: 'foam.lib.gmail',
  name: 'SyncDecorator',
  extendsModel: 'ProxyDAO',
  requires: [
    'FOAMGMailMessage'
  ],

  methods: {
    put: function(obj, sink) {
      if ( obj.deleted ) {
        this.delegate
          .where(EQ(this.FOAMGMailMessage.MESSAGE_ID, obj.id))
          .update(SET(this.FOAMGMailMessage.DELETED, true));
      }
      this.SUPER(obj, sink);
    }
  }
});
