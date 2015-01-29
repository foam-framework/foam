CLASS({
   "model_": "Model",
   "id": "foam.lib.email.EMail",
   "package": "foam.lib.email",
   "name": "EMail",
   "plural": "EMail",
   "tableProperties": [
      "from",
      "subject",
      "timestamp"
   ],
   "properties": [
      {
         "model_": "StringProperty",
         "name": "id",
         "label": "Message ID",
         "mode": "read-write",
         "required": true,
         "hidden": true,
         "displayWidth": 50,
        "compareProperty": function(a, b) {
          if ( a.length !==  b.length ) return a.length < b.length ? -1 : 1;
          var TABLE = "0123456789abcdef";

          for ( var i = 0; i < a.length; i++ ) {
            var ia = TABLE.indexOf(a[i]);
            var ib = TABLE.indexOf(b[i]);

            if ( ia !== ib ) {
              return ia < ib ? -1 : 1;
            }
          }
          return 0;
        }
      },
      {
         "model_": "StringProperty",
         "name": "convId",
         "label": "Conversation ID",
         "mode": "read-write",
         "hidden": true,
         "displayWidth": 30
      },
      {
         "model_": "DateProperty",
         "name": "timestamp",
         "label": "Date",
         "aliases": [
            "time",
            "modified",
            "t"
         ],
         "mode": "read-write",
         "required": true,
         "displayHeight": 1,
         "factory": function () { return new Date(); },
         "tableWidth": "100",
         "displayWidth": 45,
         "view": "TextFieldView",
         "preSet": function (_, d) {
        return ( typeof d === 'string' || typeof d === 'number' ) ? new Date(d) : d;
      }
      },
      {
         "model_": "StringProperty",
         "name": "from",
         "shortName": "f",
         "mode": "read-write",
         "required": true,
         "displayWidth": 90,
         "factory": function () { return GLOBAL.user || ""; },
         "tableFormatter": function (t) {
        var ret;
        if (t.search('<.*>') != -1) {
          // If it's a name followed by <email>, just use the name.
          ret = t.replace(/<.*>/, '').replace(/"/g, '');
        } else {
          // If it's just an email, only use everything before the @.
          ret = t.replace(/@.*/, '');
        }
        return ret.trim();
      },
         "tableWidth": "120"
      },
      {
         "model_": "StringArrayProperty",
         "name": "to",
         "shortName": "t",
         "required": true,
         "tableFormatter": function (t) { return t.replace(/"/g, '').replace(/<.*/, ''); },
         "displayWidth": 90
      },
      {
         "model_": "StringArrayProperty",
         "name": "cc",
         "required": true,
         "tableFormatter": function (t) { return t.replace(/"/g, '').replace(/<.*/, ''); },
         "displayWidth": 90
      },
      {
         "model_": "StringArrayProperty",
         "name": "bcc",
         "required": true,
         "tableFormatter": function (t) { return t.replace(/"/g, '').replace(/<.*/, ''); },
         "displayWidth": 90
      },
      {
         "model_": "StringArrayProperty",
         "name": "replyTo"
      },
      {
         "model_": "Property",
         "name": "subject",
         "type": "String",
         "shortName": "s",
         "mode": "read-write",
         "required": true,
         "displayWidth": 100,
         "view": "TextFieldView",
         "tableWidth": "45%"
      },
      {
         "model_": "StringArrayProperty",
         "name": "labels",
         "postSet": function (_, a) {
        if ( a ) for ( var i = 0 ; i < a.length ; i++ ) a[i] = a[i].intern();
      },
         "help": "Email labels.",
         "view": "LabelView"
      },
      {
         "model_": "Property",
         "name": "attachments",
         "label": "Attachments",
         "tableLabel": "@",
         "type": "Array[Attachment]",
         "subType": "Attachment",
         "view": "ArrayView",
         "factory": function () { return []; },
         "tableFormatter": function (a) { return a.length ? a.length : ''; },
         "tableWidth": "20",
         "help": "Email attachments."
      },
      {
         "model_": "StringProperty",
         "name": "body",
         "label": "",
         "shortName": "b",
         "displayWidth": 70,
         "summaryFormatter": function (t) {
        return '<div class="messageBody">' + t.replace(/\n/g,'<br/>') + '</div>';
      },
         "help": "Email message body.",
         "displayHeight": 20,
         "view": "TextFieldView"
      },
      {
         "model_": "foam.lib.email.EMailLabelProperty",
         "name": "starred",
         "labelName": "STARRED"
      },
      {
         "model_": "foam.lib.email.EMailLabelProperty",
         "name": "unread",
         "labelName": "UNREAD"
      },
      {
         "model_": "foam.lib.email.EMailLabelProperty",
         "name": "isDraft",
         "labelName": "DRAFT"
      },
      {
         "model_": "foam.lib.email.EMailLabelProperty",
         "name": "inInbox",
         "labelName": "INBOX"
      },
      {
         "model_": "StringProperty",
         "name": "snippet",
         "mode": "read-only",
         "defaultValueFn": function () { return this.body.substr(0, 100); }
      },
      {
         "model_": "BooleanProperty",
         "name": "messageSent",
         "help": "True if the user has marked this message to be sent.",
         "defaultValue": false
      },
      {
         "model_": "BooleanProperty",
         "name": "deleted"
      },
      {
         "model_": "IntProperty",
         "name": "clientVersion"
      },
      {
         "model_": "Property",
         "name": "type",
         "hidden": true,
         "defaultValue": "EMail"
      },
      {
         "model_": "Property",
         "name": "iconURL",
         "view": "ImageView",
         "defaultValue": "images/email.png"
      }
   ],
   "actions": [
      {
         "model_": "foam.lib.email.EMailMutationAction",
         "name": "send",
         "help": "Send the email.",
         "isAvailable": function () { return this.isDraft; },
         "isEnabled": function () { return ! this.messageSent; },
         "children": [],
         "keyboardShortcuts": [],
         "backOnComplete": true,
         "action": function (X, action) {
          var obj = this;
          a.apply(obj, arguments);
          var self = this;
          var sink = action.backOnComplete ?
            { put: function() { X.stack.back(); },
              error: function() { X.stack.back(); } } : undefined;
          X.EMailDAO && X.EMailDAO.put(obj, sink);
        }
      },
      {
         "model_": "Action",
         "name": "reply",
         "help": "Reply to an email.",
         "children": [],
         "action": function (X) {
        var replyMail = X.EMail.create({
          to: [this.from],
          subject: this.subject,
          body: this.body,
          labels: ['DRAFT'],
        });
        openComposeView(X, replyMail);
      },
         "keyboardShortcuts": []
      },
      {
         "model_": "Action",
         "name": "replyAll",
         "help": "Reply to all recipients of an email.",
         "children": [],
         "action": function (X) {
        var replyMail = X.EMail.create({
          to: [this.from],
          cc: this.cc,
          subject: 'Re.: ' + this.subject,
          body: this.body,
          labels: ['DRAFT'],
        });

        for ( var i = 0 ; i < this.to ; i++ ) {
          replyMail.to.push(this.to[i]);
        }
        openComposeView(X, replyMail);
      },
         "keyboardShortcuts": []
      },
      {
         "model_": "Action",
         "name": "forward",
         "help": "Forward an email.",
         "children": [],
         "action": function (X) {
        var forwardedMail = X.EMail.create({
          subject: this.subject,
          body: this.body,
          labels: ['DRAFT'],
        });
        openComposeView(X, forwardedMail);
      },
         "keyboardShortcuts": []
      },
      {
         "model_": "foam.lib.email.EMailMutationAction",
         "name": "star",
         "help": "Star an email.",
         "children": [],
         "keyboardShortcuts": [],
         "action": function (X, action) {
          var obj = this;
          a.apply(obj, arguments);
          var self = this;
          var sink = action.backOnComplete ?
            { put: function() { X.stack.back(); },
              error: function() { X.stack.back(); } } : undefined;
          X.EMailDAO && X.EMailDAO.put(obj, sink);
        }
      },
      {
         "model_": "foam.lib.email.EMailMutationAction",
         "name": "archive",
         "help": "Archive an email.",
         "isAvailable": function () { return this.hasLabel('INBOX'); },
         "children": [],
         "keyboardShortcuts": [],
         "action": function (X, action) {
          var obj = this;
          a.apply(obj, arguments);
          var self = this;
          var sink = action.backOnComplete ?
            { put: function() { X.stack.back(); },
              error: function() { X.stack.back(); } } : undefined;
          X.EMailDAO && X.EMailDAO.put(obj, sink);
        }
      },
      {
         "model_": "foam.lib.email.EMailMutationAction",
         "name": "moveToInbox",
         "help": "Un-archive an email.",
         "isAvailable": function () { return ! this.hasLabel('INBOX'); },
         "children": [],
         "keyboardShortcuts": [],
         "action": function (X, action) {
          var obj = this;
          a.apply(obj, arguments);
          var self = this;
          var sink = action.backOnComplete ?
            { put: function() { X.stack.back(); },
              error: function() { X.stack.back(); } } : undefined;
          X.EMailDAO && X.EMailDAO.put(obj, sink);
        }
      },
      {
         "model_": "foam.lib.email.EMailMutationAction",
         "name": "spam",
         "help": "Report an email as SPAM.",
         "isAvailable": function () { return ! this.hasLabel('SPAM'); },
         "children": [],
         "keyboardShortcuts": [],
         "action": function (X, action) {
          var obj = this;
          a.apply(obj, arguments);
          var self = this;
          var sink = action.backOnComplete ?
            { put: function() { X.stack.back(); },
              error: function() { X.stack.back(); } } : undefined;
          X.EMailDAO && X.EMailDAO.put(obj, sink);
        }
      },
      {
         "model_": "foam.lib.email.EMailMutationAction",
         "name": "trash",
         "help": "Move an email to the trash.",
         "isAvailable": function () { return ! this.hasLabel('TRASH'); },
         "children": [],
         "keyboardShortcuts": [],
         "action": function (X, action) {
          var obj = this;
          a.apply(obj, arguments);
          var self = this;
          var sink = action.backOnComplete ?
            { put: function() { X.stack.back(); },
              error: function() { X.stack.back(); } } : undefined;
          X.EMailDAO && X.EMailDAO.put(obj, sink);
        }
      },
      {
         "model_": "foam.lib.email.EMailMutationAction",
         "name": "markRead",
         "help": "Mark an email as read.",
         "isAvailable": function () { return this.hasLabel('UNREAD'); },
         "children": [],
         "keyboardShortcuts": [],
         "action": function (X, action) {
          var obj = this;
          a.apply(obj, arguments);
          var self = this;
          var sink = action.backOnComplete ?
            { put: function() { X.stack.back(); },
              error: function() { X.stack.back(); } } : undefined;
          X.EMailDAO && X.EMailDAO.put(obj, sink);
        }
      },
      {
         "model_": "foam.lib.email.EMailMutationAction",
         "name": "markUnread",
         "help": "Mark an email as unread.",
         "isAvailable": function () { return ! this.hasLabel('UNREAD'); },
         "children": [],
         "keyboardShortcuts": [],
         "action": function (X, action) {
          var obj = this;
          a.apply(obj, arguments);
          var self = this;
          var sink = action.backOnComplete ?
            { put: function() { X.stack.back(); },
              error: function() { X.stack.back(); } } : undefined;
          X.EMailDAO && X.EMailDAO.put(obj, sink);
        }
      }
   ],
   "constants": [],
   "messages": [],
   "methods": [
      {
         "model_": "Method",
         "name": "updateLabelByName",
         "code": function (id) {
      var self = this;
      EMailLabelDAO.find(EQ(EMailLabel.DISPLAY_NAME, id), {put: function(label) {
        var mail = self.clone(); mail.toggleLabel(label.id); EMailDAO.put(mail);
      }});
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "hasLabel",
         "code": function (l) { return this.labels.indexOf(l) != -1; },
         "args": []
      },
      {
         "model_": "Method",
         "name": "toggleLabel",
         "code": function (l) { this.hasLabel(l) ? this.removeLabel(l) : this.addLabel(l); },
         "args": []
      },
      {
         "model_": "Method",
         "name": "addLabel",
         "code": function (l) { this.labels = this.labels.deleteF(l).pushF(l); },
         "args": []
      },
      {
         "model_": "Method",
         "name": "removeLabel",
         "code": function (l) { this.labels = this.labels.deleteF(l); },
         "args": []
      },
      {
         "model_": "Method",
         "name": "atoMime",
         "code": function (ret) {
      // Filter attachments into inline and non-inline attachments.
      var inline = [];
      var attachments = []
      for ( var i = 0; i < this.attachments.length; i++ ) {
        if ( this.attachments[i].inline )
          inline.push(this.attachments[i]);
        else
          attachments.push(this.attachments[i]);
      }

      // Utility function for defining unique bounday values.
      var newBoundary = (function() {
        var boundary = Math.floor(Math.random() * 10000);
        return function() { return (boundary += 1).toString(16); };
      })();

      var body = "Content-Type: text/html; charset=UTF-8\r\n\r\n";

      var fragment = new DocumentFragment();
      fragment.appendChild(document.createElement('body'));
      fragment.firstChild.innerHTML = this.body;
      var images = fragment.querySelectorAll('img');
      for ( var i = 0; i < images.length; i++ ) {
        if ( images[i].id ) {
          images[i].src = 'cid:' + images[i].id;
          images[i].removeAttribute('id');
        }
      }
      body += fragment.firstChild.innerHTML + "\r\n";

      var i;
      var self = this;

      var addAttachments = function(attachments, inline) {
        return aseq(
          function(ret) {
            boundary = newBoundary();

            body = "Content-Type: multipart/" +
              ( inline ? 'related' : 'mixed' ) + "; boundary=" + boundary + "\r\n\r\n"
              + "--" + boundary + "\r\n"
              + body
              + "\r\n--" + boundary;
            i = 0;
            ret();
          },
          awhile(
            function() { return i < attachments.length; },
            aseq(
              function(ret) {
                var att = attachments[i];
                i++;
                att.atoMime(ret);
              },
              function(ret, data) {
                body += "\r\n" + data;
                body += "--" + boundary;
                ret();
              })),
          function(ret) {
            body += "--";
            ret();
          });
      };

      aseq(
        aif(inline.length > 0,
            addAttachments(inline, true)),
        aif(attachments.length > 0,
            addAttachments(attachments, false)))(function() {
              body = "From: " + self.from + "\r\n" +
                "To: " + self.to.join(', ') + "\r\n" +
                (self.cc.length ? "Cc: " + self.cc.join(", ") + "\r\n" : "") +
                (self.bcc.length ? "Bcc: " + self.bcc.join(", ") + "\r\n" : "") +
                "Subject: " + self.subject + "\r\n" +
                body;
              ret(body);
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
