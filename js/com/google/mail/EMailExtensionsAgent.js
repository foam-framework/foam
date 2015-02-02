CLASS({
   "model_": "Model",
   "id": "com.google.mail.EMailExtensionsAgent",
   "package": "com.google.mail",
   "name": "EMailExtensionsAgent",
   "requires": [
      "foam.lib.email.EMail"
   ],
   "properties": [],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
         "model_": "Method",
         "name": "execute",
         "code": function () {
      var self = this;
      Object_forEach({
        ARCHIVE:       'archive',
        TRASH:         'delete',
        REPLY:         'reply',
        REPLY_ALL:     'reply_all',
        SPAM:          'report',
        FORWARD:       'forward',
        STAR:          'star',
        MOVE_TO_INBOX: 'inbox',
        SEND:          'send',
        MARK_UNREAD:   'markunread'
      }, function(image, name) {
        self.EMail[name].copyFrom({iconUrl: 'icons/ic_' + image + '_black_24dp.png', label: ''});
      });
    },
         "args": []
      }
   ],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
