CLASS({
  package: 'foam.lib.gmail',
  name: 'Sync',
  extendsModel: 'foam.core.dao.Sync',
  requires: [
    'FOAMGMailMessage'
  ],
  methods: {
    purge: function(ret, remoteLocal) {
      // Drafts that were created and sent from the client with no sync in
      // between, do not get marked as deleted.  However if the client version
      // is old and the draft is marked as sent, then it is no longer needed.
      var self = this;
      this.SUPER(function(purged) {
        this.local
          .where(AND(LTE(this.localVersionProp, remoteLocal),
                     EQ(this.FOAMGMailMessage.IS_SENT, true),
                     EQ(this.FOAMGMailMessage.LABEL_IDS, 'DRAFT')))
          .removeAll(purged)(ret);
      }.bind(this), remoteLocal);
    }
  }
});
