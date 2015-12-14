CLASS({
  package: 'com.google.inno',
  name: 'Message',
  traits: [
    'foam.core.dao.SyncTrait'
  ],
  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'from',
      type: 'String'
    },
    {
      name: 'content',
      type: 'String'
    },
    {
      name: 'bucket',
      type: 'String'
    },
    {
      name: 'timestamp',
      type: 'DateTime',
      factory: function() {
        return new Date();
      }
    },
    {
      name: 'relevance',
      type: 'Int'
    }
  ],
  methods: [
    function toRowE(X) {
      return X.E('div')
        .start('span')
        .add('[', this.timestamp.getHours(), '-', this.timestamp.getMinutes(), '] ')
        .end('span')
        .add(this.from, ': ', this.content);
    }
  ]
});
