/**
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
   "package": "foam.lib.email",
   "name": "Conversation",
   "tableProperties": [
      "recipients",
      "subject",
      "timestamp"
   ],
   "properties": [
      {
         model_: "Property",
         "name": "id"
      },
      {
         model_: "Property",
         "name": "recipients",
         "tableWidth": "100"
      },
      {
         type: 'String',
         "name": "subject",
         "shortName": "s",
         "mode": "read-write",
         "required": true,
         "displayWidth": 100,
         "tableFormatter": function (s, self, view) {
        var sanitizedSubject = view.strToHTML(s);
        return self.isUnread ?
          '<b>' + sanitizedSubject + '</b>' :
          sanitizedSubject ;
      },
         "tableWidth": "45%",
         "view": "foam.ui.TextFieldView"
      },
      {
         type: 'Date',
         "name": "timestamp",
         "tableWidth": "75"
      },
      {
         model_: "Property",
         "name": "emails",
         "view": "EMailsView"
      },
      {
         model_: "Property",
         "name": "isUnread"
      },
      {
         type: 'StringArray',
         "name": "labels",
         "postSet": function (oldValue, newValue) {
        if (!newValue || !newValue.length) return;
        var self = this;
        this.isUnread = false;
        EMailLabelDAO.find(EQ(EMailLabel.DISPLAY_NAME, '^u'), {put: function(unreadLabel) {
          newValue.forEach(function(label) {
            if (label == unreadLabel.id) {
              self.isUnread = true;
            }
          });
        }});
      },
         "help": "Email labels.",
         "view": "LabelView"
      }
   ],
   "actions": [
      {
         model_: "foam.lib.email.ConversationAction",
         "children": [],
         "keyboardShortcuts": [],
         "delegate":          {
            model_: "Action",
            "name": "reply",
            "help": "Reply to an email.",
            "children": [],
            "action": function (X) {
        var replyMail = X.foam.lib.email.EMail.create({
          to: [this.from],
          subject: this.subject,
          body: this.body,
          labels: ['DRAFT'],
        });
        X.openComposeView(X, replyMail);
      },
            "keyboardShortcuts": []
         },
         "applyOnAll": false
      },
      {
         model_: "foam.lib.email.ConversationAction",
         "children": [],
         "keyboardShortcuts": [],
         "delegate":          {
            model_: "Action",
            "name": "replyAll",
            "help": "Reply to all recipients of an email.",
            "children": [],
            "action": function (X) {
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
      },
            "keyboardShortcuts": []
         },
         "applyOnAll": false
      },
      {
         model_: "foam.lib.email.ConversationAction",
         "children": [],
         "keyboardShortcuts": [],
         "delegate":          {
            model_: "Action",
            "name": "forward",
            "help": "Forward an email.",
            "children": [],
            "action": function (X) {
        var forwardedMail = X.foam.lib.email.EMail.create({
          subject: this.subject,
          body: this.body,
          labels: ['DRAFT'],
        });
        X.openComposeView(X, forwardedMail);
      },
            "keyboardShortcuts": []
         },
         "applyOnAll": false
      },
      {
         model_: "foam.lib.email.ConversationAction",
         "children": [],
         "keyboardShortcuts": [],
         "delegate":          {
            model_: "foam.lib.email.EMailMutationAction",
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
         "applyOnAll": false
      },
      {
         model_: "foam.lib.email.ConversationAction",
         "children": [],
         "keyboardShortcuts": [],
         "delegate":          {
            model_: "foam.lib.email.EMailMutationAction",
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
         }
      },
      {
         model_: "foam.lib.email.ConversationAction",
         "children": [],
         "keyboardShortcuts": [],
         "delegate":          {
            model_: "foam.lib.email.EMailMutationAction",
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
         }
      },
      {
         model_: "foam.lib.email.ConversationAction",
         "children": [],
         "keyboardShortcuts": [],
         "delegate":          {
            model_: "foam.lib.email.EMailMutationAction",
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
         }
      },
      {
         model_: "foam.lib.email.ConversationAction",
         "children": [],
         "keyboardShortcuts": [],
         "delegate": null
      }
   ],
   "constants": [],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "put",
         "code": function (email) {
      if ( ! this.emails ) this.emails = [];
      this.emails.put(email);
      this.id = email.convId;
      this.update();
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "remove",
         "code": function (email) {
      if ( ! this.emails ) this.emails = [];
      for ( var i = 0; i < this.emails.length; i++ ) {
        if ( email.id === this.emails[i].id ) {
          this.emails.splice(i--, 1);
        }
      }
      this.update();
    },
         "args": []
      }
   ],
   "listeners": [
      {
         model_: "Method",
         "name": "update",
         "code": function () {
        if ( ! this.emails || this.emails.length === 0 ) return;
        // TODO the primary email should be the most recent email that matches the query
        // that we haven't yet given this model.
        var primaryEmail = this.emails[0];

        this.subject = primaryEmail.subject;

        var allSenders = [];
        var seenSenders = {};
        for (var i = 0, m; m = this.emails[i]; i++) {
          // TODO this needs work:
          // 1. bold unread
          // 2. strip last names when more than one name
          // 3. limit to 3 senders (first sender followed by last two i think)
          // 4. dont dedupe senders that have an unread and a read message. They should show twice.
          if (!seenSenders[m.from]) {
            allSenders.push(EMail.FROM.tableFormatter(m.from));
            seenSenders[m.from] = true;
          }
        }
        this.recipients = allSenders.join(', ');
        if ( this.emails.length > 1 ) {
          this.recipients += ' (' + this.emails.length + ')';
        }
        this.timestamp = primaryEmail.timestamp;

        // Concat all of the labels together.
        var m = {};
        this.emails.forEach(function(e) { e.labels.forEach(function(l) { m[l] = 1; }); });
        this.labels = Object.keys(m);
      },
         "args": []
      }
   ],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
