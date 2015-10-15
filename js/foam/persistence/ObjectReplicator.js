CLASS({
  package: 'foam.persistence',
  name: 'ObjectReplicator',
  properties: [
    'id',
    'model',
    'args',
    'dao',
    {
      model_: 'BooleanProperty',
      name: 'feedback',
      defaultValue: false
    },
    {
      name: 'pk',
      lazyFactory: function() {
        // TODO: Support multi part keys
        return this.model.getProperty(this.model.ids[0]);
      }
    },
    {
      name: 'future',
      lazyFactory: function() {
        var self = this;
        var fut = afuture();
        this.dao.find(self.id, {
          put: function(obj) {
            fut.set(obj);
          }
        });
        fut.get(function(o) {
          self.obj = o;
          self.attach();
        })
        return fut;
      }
    },
    {
      name: 'daoListener',
      factory: function() {
        return {
          put: this.onPut,
          remove: this.onRemove
        };
      }
    }
  ],
  methods: [
    function destroy() {
      this.obj.removeListener(this.objChanged);
      this.dao.unlisten(this.daoListener);
    },
    function attach() {
      this.obj.addListener(this.objChanged);
      this.dao.where(EQ(this.pk, this.obj.id)).listen(this.daoListener)
    }
  ],
  listeners: [
    {
      name: 'objChanged',
      code: function(o) {
        if ( this.feedback )
          return;

        var clone = this.obj.deepClone();
        this.dao.put(clone, {
          put: function(obj2) {
            this.obj.copyFrom(obj2);
          }.bind(this)
        });
      }
    },
    {
      name: 'onPut',
      code: function() {
        this.dao.find(this.id, {
          put: function(obj2) {
            if ( ! this.obj ) {
              this.future.set(obj2);
            } else {
              this.feedback = true;
              this.obj.copyFrom(obj2);
              this.feedback = false;
            }
          }.bind(this)
        });
      }
    },
    {
      name: 'onRemove',
      code: function() {
        // TODO
      }
    }
  ]
});
