CLASS({
  package: 'foam.persistence',
  name: 'PersistentContext',

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old ) old.removeListener(this.onUpdate_);
        if ( nu ) nu.addListener(this.onUpdate_);
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'feedback_',
      defaultValue: false
    },
    {
      name: 'sink'
    }
  ],

  listeners: [
    {
      name: 'onUpdate_',
      code: function() {
        if ( ! this.feedback_ ) this.onUpdate();
      }
    },
    {
      name: 'onUpdate',
      isMerged: 100,
      code: function() {
        this.sink.put(this.data, {
          put: function(obj) {
            this.feedback_ = true;
            this.data.copyFrom(obj);
            this.feedback_ = false;
          }.bind(this),
          error: function() {
          }
        });
      }
    }
  ]
});
