/*
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  model_: "Model",
  package: "foam.lib.email",
  name: "EMail",
  traits: [
    "foam.core.dao.SyncTrait"
  ],
  plural: "EMail",
  ids: [
    "id"
  ],
  tableProperties: [
    "from",
    "subject",
    "timestamp"
  ],
  properties: [
    {
      model_: "StringProperty",
      name: "id"
    },
    {
      model_: "StringProperty",
      name: "emailId",
      visibility: "hidden",
      hidden: true,
      compareProperty: function (a, b) {
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
      model_: "StringProperty",
      name: "convId",
      label: "Conversation ID",
      visibility: "hidden",
      hidden: true
    },
    {
      name: 'owner',
      hidden: true
    },
    {
      model_: "DateProperty",
      name: "timestamp",
      label: "Date",
      aliases: [
        "time",
        "modified",
        "t"
      ]
    },
    {
      model_: "StringProperty",
      name: "from",
      shortName: "f",
      factory: function () { return this.X.user || ""; },
      tableFormatter: function (t) {
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
      tableWidth: "120"
    },
    {
      model_: "StringArrayProperty",
      name: "to",
      shortName: "t",
      tableFormatter: function (t) { return t.replace(/"/g, '').replace(/<.*/, ''); },
      displayWidth: 90
    },
    {
      model_: "StringArrayProperty",
      name: "cc",
      tableFormatter: function (t) { return t.replace(/"/g, '').replace(/<.*/, ''); },
      displayWidth: 90
    },
    {
      model_: "StringArrayProperty",
      name: "bcc",
      tableFormatter: function (t) { return t.replace(/"/g, '').replace(/<.*/, ''); },
      displayWidth: 90
    },
    {
      model_: "StringArrayProperty",
      name: "replyTo"
    },
    {
      model_: "StringProperty",
      name: "subject",
      shortName: "s",
      displayWidth: 100,
      tableWidth: "45%"
    },
    {
      model_: "StringArrayProperty",
      name: "labels",
      postSet: function (_, a) {
        if ( a ) for ( var i = 0 ; i < a.length ; i++ ) a[i] = a[i].intern();
      },
      help: "Email labels."
    },
    {
      model_: "ArrayProperty",
      name: "attachments",
      tableLabel: "@",
      tableFormatter: function (a) { return a.length ? a.length : ''; },
      tableWidth: "20",
      help: "Email attachments.",
      subType: "Attachment"
    },
    {
      model_: "StringProperty",
      name: "body",
      label: "",
      shortName: "b",
      displayWidth: 70,
      summaryFormatter: function (t) {
        return '<div class="messageBody">' + t.replace(/\n/g,'<br/>') + '</div>';
      },
      help: "Email message body.",
      displayHeight: 20
    },
    {
      model_: "foam.lib.email.EMailLabelProperty",
      name: "starred"
    },
    {
      model_: "foam.lib.email.EMailLabelProperty",
      name: "unread"
    },
    {
      model_: "foam.lib.email.EMailLabelProperty",
      name: "isDraft"
    },
    {
      model_: "foam.lib.email.EMailLabelProperty",
      name: "inInbox"
    },
    {
      model_: "StringProperty",
      name: "snippet",
      mode: "read-only",
      defaultValueFn: function () { return this.body.substr(0, 100); }
    },
    {
      model_: "BooleanProperty",
      name: "messageSent",
      help: "True if the user has marked this message to be sent.",
      defaultValue: false
    },
    {
      model_: "BooleanProperty",
      name: "deleted"
    },
    {
      name: "type",
      visibility: "hidden",
      hidden: true,
      defaultValue: "EMail"
    },
    {
      name: "iconURL",
      view: "foam.ui.ImageView",
      defaultValue: "images/email.png"
    }
  ],
  actions: [
    {
      model_: "foam.lib.email.EMailMutationAction",
      code: function () { this.messageSent = true; },
      name: "send",
      help: "Send the email.",
      isAvailable: function () { return this.isDraft; },
      isEnabled: function () { return ! this.messageSent; },
      backOnComplete: true
    },
    {
      name: "reply",
      help: "Reply to an email.",
      code: function (X) {
        var replyMail = X.foam.lib.email.EMail.create({
          to: [this.from],
          subject: this.subject,
          body: this.body,
          labels: ['DRAFT'],
        });
        X.openComposeView(X, replyMail);
      }
    },
    {
      name: "replyAll",
      help: "Reply to all recipients of an email.",
      code: function (X) {
        var replyMail = X.foam.lib.email.EMail.create({
          to: [this.from],
          cc: this.cc,
          subject: 'Re.: ' + this.subject,
          body: this.body,
          labels: ['DRAFT'],
        });

        for ( var i = 0 ; i < this.to ; i++ ) {
          replyMail.to.push(this.to[i]);
        }
        X.openComposeView(X, replyMail);
      }
    },
    {
      name: "forward",
      help: "Forward an email.",
      code: function (X) {
        var forwardedMail = X.foam.lib.email.EMail.create({
          subject: this.subject,
          body: this.body,
          labels: ['DRAFT'],
        });
        X.openComposeView(X, forwardedMail);
      }
    },
    {
      model_: "foam.lib.email.EMailMutationAction",
      code: function () { this.toggleLabel('STARRED'); },
      name: "star",
      help: "Star an email."
    },
    {
      model_: "foam.lib.email.EMailMutationAction",
      code: function () { this.removeLabel('INBOX'); },
      name: "archive",
      help: "Archive an email.",
      isAvailable: function () { return this.hasLabel('INBOX'); }
    },
    {
      model_: "foam.lib.email.EMailMutationAction",
      code: function () {
        this.addLabel('INBOX');
        this.removeLabel('SPAM');
        this.removeLabel('TRASH');
      },
      name: "moveToInbox",
      help: "Un-archive an email.",
      isAvailable: function () { return ! this.hasLabel('INBOX'); }
    },
    {
      model_: "foam.lib.email.EMailMutationAction",
      code: function () {
        this.removeLabel('INBOX');
        this.addLabel('SPAM');
      },
      name: "spam",
      help: "Report an email as SPAM.",
      isAvailable: function () { return ! this.hasLabel('SPAM'); }
    },
    {
      model_: "foam.lib.email.EMailMutationAction",
      code: function () {
        this.removeLabel('INBOX');
        this.addLabel('TRASH');
      },
      name: "trash",
      help: "Move an email to the trash.",
      isAvailable: function () { return ! this.hasLabel('TRASH'); }
    },
    {
      model_: "foam.lib.email.EMailMutationAction",
      code: function () { this.removeLabel('UNREAD'); },
      name: "markRead",
      help: "Mark an email as read.",
      isAvailable: function () { return this.hasLabel('UNREAD'); }
    },
    {
      model_: "foam.lib.email.EMailMutationAction",
      code: function () { this.addLabel('UNREAD'); },
      name: "markUnread",
      help: "Mark an email as unread.",
      isAvailable: function () { return ! this.hasLabel('UNREAD'); }
    }
  ],
  methods: [
    {
      name: "updateLabelByName",
      code: function (id) {
        var self = this;
        EMailLabelDAO.find(EQ(EMailLabel.DISPLAY_NAME, id), {put: function(label) {
          var mail = self.clone(); mail.toggleLabel(label.id); EMailDAO.put(mail);
        }});
      }
    },
    {
      name: "hasLabel",
      code: function (l) { return this.labels.indexOf(l) != -1; }
    },
    {
      name: "toggleLabel",
      code: function (l) { this.hasLabel(l) ? this.removeLabel(l) : this.addLabel(l); }
    },
    {
      name: "addLabel",
      code: function (l) { this.labels = this.labels.deleteF(l).pushF(l); }
    },
    {
      name: "removeLabel",
      code: function (l) { this.labels = this.labels.deleteF(l); }
    },
    {
      name: "atoMime",
      code: function (ret) {
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
      }
    }
  ]
});
