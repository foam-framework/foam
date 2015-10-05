CLASS({
  package: 'foam.apps.chatter',
  name: 'ClientView',
  extendsModel: 'foam.ui.DetailView',
  requires: [
    'foam.apps.chatter.ChannelView',
    'foam.apps.chatter.Channel',
    'foam.apps.chatter.ChannelCitationView',
    'foam.apps.chatter.NotificationsView',
    'foam.ui.DAOListView'
  ],
  imports: [
    'window',
  ],
  exports: [
    'selection$',
    'as clientView'
  ],
  properties: [
    {
      name: 'newChannel',
      postSet: function(_, name) {
        if ( name ) {
          this.data.channelDAO.put(
            this.Channel.create({
              name: name
            }));
          this.newChannel = '';
        }
      }
    },
    {
      name: 'selection'
    },
    'channelDAOView',
    {
      name: 'windows',
      factory: function() { return {}; }
    },
    {
      name: 'notificationsView',
      factory: function() { return this.NotificationsView.create(); }
    }
  ],
  methods: [
    function openChannel(id) {
      if ( this.windows[id] && this.windows[id].window ) {
        this.windows[id].focus();
        return;
      }
      var window = foam.ui.Window.create({
        window: this.window.open("", "", "")}, this.Y);
      var X = window.Y;
      this.windows[id] = window.window;

      this.data.channelDAO.find(id, {
        put: function(c) {
          X.writeView(this.ChannelView.create({ data: c }, X));
        }.bind(this),
        error: function() {
          window.close();
        }
      });
    },
    function initHTML() {
      this.SUPER();
      this.channelDAOView.subscribe(this.channelDAOView.ROW_CLICK, this.onChannelSelect);
      this.addDestructor(function() {
        this.channelDAOView.unsubscribe(this.channelDAOView.ROW_CLICK, this.onChannelSelect);
      }.bind(this));
    }
  ],
  listeners: [
    {
      name: 'onChannelSelect',
      code: function() {
        var id = this.channelDAOView.selection.id;
        this.openChannel(id);
      }
    }
  ],
  templates: [
    { name: 'toHTML' }
  ]
});
