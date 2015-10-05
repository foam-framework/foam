CLASS({
  package: 'foam.apps.chatter',
  name: 'NotificationsView',
  imports: [
    'messageDAO',
    'clientView',
    'nickname$ as name'
  ],
  properties: [
    {
      name: 'messageDAO',
      postSet: function(old, nu) {
        if ( old ) old.unlisten(this.listener);
        if ( nu ) nu.listen(this.listener);
      }
    },
    {
      name: 'listener',
      factory: function() {
        var self = this;
        return {
          put: function(m) {
            if ( Notification.permission != 'granted' ) return;

            if ( m.content.indexOf(self.name.get()) != -1 ) {
              var n = new Notification(m.from + ': ' + m.content);
              n.onclick = function() {
                self.clientView.openChannel(m.channelId);
              };
            }
          }
        }
      }
    }
  ],
  methods: [
    function init() {
      Notification.requestPermission(function() {});
    },
  ]
});
