CLASS({
  package: 'foam.demos',
  name: 'ContainerManagedPersistence',
  requires: [
    'foam.persistence.PersistentContext',
    'foam.ui.DetailView'
  ],
  imports: ['setTimeout'],
  properties: [
    {
      name: 'context',
      hidden: true,
      factory: function() {
        return this.PersistentContext.create();
      }
    },
    {
      name: 'settings',
      view: 'foam.ui.DetailView',
      factory: function() {
        return this.Preferences.create({
          receiveEmails: false,
          name: 'adam'
        })
      },
      postSet: function(_, data) {
        this.context.sink = this.put;
        this.context.data = data;
      }
    },
  ],
  listeners: [
    {
      name: 'put',
      code: function(obj, sink) {
        obj = obj.deepClone();
        this.setTimeout(function() {
          obj.version += 1;
          sink.put(obj);
        }, 1000);
      }
    }
  ],
  models: [
    {
      name: 'Preferences',
      properties: [
        {
          model_: 'IntProperty',
          name: 'version',
          mode: 'read-only',
          defaultValue: 0
        },
        {
          model_: 'BooleanProperty',
          name: 'receiveEmails',
        },
        {
          model_: 'StringProperty',
          name: 'name'
        },
        {
          model_: 'foam.core.types.StringEnumProperty',
          name: 'type',
          choices: [
            'A',
            'B',
            'C'
          ],
          defaultValue: 'A'
        }
      ]
    }
  ]
});
