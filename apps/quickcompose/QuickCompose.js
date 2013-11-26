/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

// Replace the RichTextView labels with icons.
// TODO: move this to RichTextView.js as the default.
RichTextView.BOLD.iconUrl      = '/images/bold.svg';
RichTextView.ITALIC.iconUrl    = '/images/italics.svg';
RichTextView.UNDERLINE.iconUrl = '/images/underline.svg';
RichTextView.LINK.iconUrl      = '/images/insert_link.svg';
RichTextView.BOLD.label        = '';
RichTextView.ITALIC.label      = '';
RichTextView.UNDERLINE.label   = '';
RichTextView.LINK.label        = '';


var QuickEMail = FOAM({
  model_: 'Model',
  extendsModel: 'EMail',
  name: 'QuickEMail',
  properties: [
    {
      name: 'to',
      displayWidth: 55,
      view: {
        // TODO: Fetch this dependencies via context.
        create: function() {
          return ListValueView.create({
            inputView: ListInputView.create({
              dao: ContactDAO,
              property: Contact.EMAIL,
              searchProperties: [Contact.EMAIL, Contact.FIRST, Contact.LAST],
              autocompleteView: AutocompleteListView.create({
                innerView: ContactListTileView,
                count: 8
              })
            }),
            valueView: ArrayTileView.create({
              dao: DefaultObjectDAO.create({
                delegate: ContactDAO,
                factory: function(q) {
                  var obj = Contact.create({});
                  obj[q.arg1.name] = q.arg2.arg1;
                  return obj;
                }
              }),
              property: Contact.EMAIL,
              tileView: ContactSmallTileView
            })
          });
        }
      }
    },
    { name: 'subject', displayWidth: 55 },
    { name: 'body',    view: 'RichTextView' }
  ]
});


var QuickEMailView = Model.create({
  name: 'QuickEMailView',

  extendsModel: 'DetailView',

  properties: [
    {
      name: 'bodyView',
      valueFactory: function() {
        var v = this.createView(QuickEMail.BODY);
        v.width = 335;
        v.height = 331;
        return v;
      }
    }
  ],

  templates: [
    {
      name: "toHTML",
      template:
        '<div id="<%= this.getID() %>" class="quickcompose">' +
        '<% var v = this.createView(QuickEMail.TO); v.placeholder = QuickEMail.TO.label; out(v.toHTML()); %>' +
        '<%     v = this.createView(QuickEMail.SUBJECT); v.placeholder = QuickEMail.SUBJECT.label; out(v.toHTML()); %>' +
        '<%= this.bodyView.toHTML() %><br>' +
        '</div>'
    }
  ]
});


var QuickCompose = FOAM({
  model_: 'Model',

  name: 'QuickCompose',

  properties: [
    {
      name: 'window'
    },
    {
      name: 'email',
      valueFactory: function() {
        // TODO: Look for a draft in the EMailDAO
        return QuickEMail.create({id: 'tmp' + Date.now()});
      }
    },
    {
      name: 'view',
      valueFactory: function() {
        return QuickEMailView.create({
          model: QuickEMail
        });
      }
    },
    {
      name: 'sendButton',
      valueFactory: function() { return ActionButton.create({action: this.model_.SEND, value: SimpleValue.create(this)}); }
    },
    {
      name: 'boldButton',
      valueFactory: function() {
        return ActionButton.create({action: RichTextView.BOLD, value: SimpleValue.create(this.view.bodyView) });
      }
    },
    {
      name: 'italicButton',
      valueFactory: function() {
        return ActionButton.create({action: RichTextView.ITALIC, value: SimpleValue.create(this.view.bodyView) });
      }
    },
    {
      name: 'underlineButton',
      valueFactory: function() {
        return ActionButton.create({action: RichTextView.UNDERLINE, value: SimpleValue.create(this.view.bodyView) });
      }
    },
    {
      name: 'linkButton',
      valueFactory: function() {
        return ActionButton.create({action: RichTextView.LINK, value: SimpleValue.create(this.view.bodyView) });
      }
    },
    {
      name: 'discardButton',
      valueFactory: function() { return ActionButton.create({action: this.model_.DISCARD, value: SimpleValue.create(this)}); }
    },
    {
      name: 'closeButton',
      valueFactory: function() { return ActionButton.create({action: this.model_.CLOSE, value: SimpleValue.create(this)}); }
    },
    {
      name: 'EMailDAO',
      defaultValueFn: function() { return EMailDAO; }
    },
    {
      name: 'ContactDAO',
      defaultValueFn: function() { return ContactDAO; }
    }
  ],

  methods: {
    initHTML: function() {
      this.view.value = this.propertyValue('email');
      this.view.initHTML();
      this.sendButton.initHTML();
      this.boldButton.initHTML();
      this.italicButton.initHTML();
      this.underlineButton.initHTML();
      this.linkButton.initHTML();
      this.discardButton.initHTML();
      this.closeButton.initHTML();

      // This doesn't work when the view is a RichTextView because the
      // iframe is prevented from receiving the file.
      var dropzone = this.view.$;
      // var dropzone = this.window.document.body;
      console.log('adding dropzone ', this.view.$);
      dropzone.addEventListener('drop', function(evt) { console.log('true: ', evt); }, true); 
      dropzone.addEventListener('drop', function(evt) { console.log('false: ', evt); }, false); 
      dropzone.ondrop2 = function(e) {
        console.log('onDrop ', e);
        /*
        var length = e.dataTransfer.files.length;
        for ( var i = 0 ; i < length ; i++ ) {
          var file = e.dataTransfer.files[i];
console.log('dropped file: ' + file);
        }
        */
      };
    }
  },

   actions: [
     {
       model_: 'Action',
       name:  'send',
       help:  'Send the current email.',

       // TODO: Don't enable send unless subject, to, and body set
       isEnabled:   function() { return true; },
       action:      function() {
         this.email.timeStamp = new Date();
         this.EMailDAO.put(this.email);
         this.window.close();
       }
     },
     {
       model_: 'Action',
       name:  'discard',
       label: '',
       iconUrl: '/images/trash.svg',
       help:  'Discard the current email.',

       action: function() {
         this.email.to = [];
         this.email.subject = '';
         this.email.body = '';
         this.close();
       }
     },
     {
       model_: 'Action',
       name:  'close',
       label: 'x',
       help:  'Close the window.',

       action: function() {
         this.appWindow.minimize();
       }
     }
   ],

  templates: [
    {
      name: "toHTML",
      template: "<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"foam.css\" /><link rel=\"stylesheet\" type=\"text/css\" href=\"quickcompose.css\" /><link rel=\"stylesheet\" type=\"text/css\" href=\"contacts.css\" /><title>New message</title></head><body><% this.header(out); %><%= this.view.toHTML() %><% this.toolbar(out); %></body></html>"
    },
    {
      name: "header",
      template: "<table width=100% class=header><tr><td>New message</td><td align=right><%= this.closeButton.toHTML() %></td></tr></table>"
    },
    {
      name: "toolbar",
      template: "<table width=100% class=toolbar><tr><td width=1><%= this.sendButton.toHTML() %></td><td><%= this.boldButton.toHTML(), this.italicButton.toHTML(), this.underlineButton.toHTML(), this.linkButton.toHTML() %></td><td align=right><%= this.discardButton.toHTML() %></td></tr></table>"
    }
  ]
});
