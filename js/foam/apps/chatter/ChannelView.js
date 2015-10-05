CLASS({
  package: 'foam.apps.chatter',
  name: 'ChannelView',
  extendsModel: 'foam.ui.View',
  requires: [
    'foam.apps.chatter.Message'
  ],
  imports: [
    'nickname$ as name'
  ],
  properties: [
    {
      name: 'orderedMessages',
      factory: function() {
        return this.data.messages.orderBy(this.Message.TIMESTAMP);
      }
    },
    {
      name: 'input',
      postSet: function(_, value) {
        if ( value ) {
          this.data.messages.put(
            this.Message.create({
              content: value,
              from: this.name.get()
            }));
          this.input = '';
        }
      }
    }
  ],
  templates: [
    { name: 'toHTML' }
  ]
});
