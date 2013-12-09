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

var AttachmentView = FOAM({
  model_: 'Model',
  extendsModel: 'AbstractView',

  name: 'AttachmentView',

  properties: [
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(value) {
        value.addListener(this.redraw.bind(this));
      }
    }
  ],

  listeners: [
    {
      model_: 'Method',
      name: 'onRemove',
      code: function(attr) {
        this.value.set(this.value.get().removeF(EQ(Attachment.ID, attr.id)));
      }
    }
  ],

  methods: {
    // TODO: deprecate and remove
    setValue: function(value) {
      this.value = value;
    },

    toHTML: function() {
      return '<div id="' + this.getID() + '" class="attachments2"></div>';
    },

    initHTML: function() {
      // this.SUPER();

      this.value = this.value;
      // this.value.addListener(this.redraw.bind(this));
      this.redraw();
    },

    old_toInnerHTML: function() {
      if ( ! this.value.get().length ) return "";
      
      var out = "";

      if ( this.value.get().length ) {
        out += '<hr>';
        out += '<table width=100%>';
        var attachments = this.value.get().sort(Attachment.FILENAME);
        for ( var i = 0 ; i < attachments.length ; i++ ) {
          var att = attachments[i];
          var size = Math.round(att.size/1000).toLocaleString() + 'k';
          out += '<tr class="attachment"><td class="filename">' + att.filename + '</td><td class="size">' + size + '</td><td class="remove"><button id="' + this.registerCallback('click', this.onRemove.bind(this, att)) + '">x</button></td></tr>';
        }
        out += '</table>';
        out += '<hr>';
      }
      out += '</table>';
      out += '<hr>';

      return out;
    },

    toInnerHTML: function() {
      this.$.style.display = this.value.get().length ? 'block' : 'none';

      var out = "";

      for ( var i = 0 ; i < this.value.get().length ; i++ ) {
        var att = this.value.get()[i];
        var size = '(' + Math.round(att.size/1000).toLocaleString() + 'k)';
        out += '<div class="attachment2"><span class="filename">' + att.filename + '</span><span class="size">' + size + '</span><span class="remove"><button id="' + this.registerCallback('click', this.onRemove.bind(this, att)) + '">x</button></span></div>';
      }

      return out;
    },

    redraw: function() {
      this.$.innerHTML = this.toInnerHTML();
      this.registerCallbacks();
    }
  }
});


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
              dao: ContactAvatarDAO,
              property: Contact.EMAIL,
              searchProperties: [Contact.EMAIL, Contact.FIRST, Contact.LAST],
              autocompleteView: AutocompleteListView.create({
                innerView: ContactListTileView,
                count: 8
              })
            }),
            valueView: ArrayTileView.create({
              dao: DefaultObjectDAO.create({
                delegate: ContactAvatarDAO,
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
    { name: 'subject',     displayWidth: 55 },
    { name: 'attachments', view: 'AttachmentView' },
    { name: 'body',        view: 'RichTextView' }
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

        v.height = 100;

        return v;
      }
    }
  ],

  templates: [
    {
      name: "toHTML",
      template:
        '<% var v = this.createView(QuickEMail.TO); v.placeholder = QuickEMail.TO.label; out(v.toHTML()); %>' +
        '<%     v = this.createView(QuickEMail.SUBJECT); v.placeholder = QuickEMail.SUBJECT.label; out(v.toHTML()); %>' +
        '<%= this.bodyView.toHTML() %>' +
        '<%= this.createView(QuickEMail.ATTACHMENTS).toHTML() %>'
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
      name: 'userInfo'
    },
    {
      name: 'email',
      valueFactory: function() {
        // TODO: Look for a draft in the EMailDAO
        return QuickEMail.create({from: this.userInfo.email, id: Date.now()});
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

      this.view.bodyView.subscribe('attachmentAdded', this.addAttachment);

      // Remove images when their attachments are removed.
      this.email.propertyValue('attachments').addListener(function(_, _, oldAtts, newAtts) {
         for ( var i = 0 ; i < oldAtts.length ; i++ ) {
           var a = oldAtts[i];
           if ( newAtts.indexOf(a) == -1 ) {
             this.view.bodyView.removeImage(a.id);
           }
         }
      }.bind(this));
    }
  },

   actions: [
     {
       model_: 'Action',
       name:  'send',
       help:  'Send (Ctrl-Enter)',

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
       help:  'Discard draft',

       action: function() {
         this.email.to = [];
         this.email.subject = '';
         this.email.body = '';
         this.email.attachments = [];

         // This is required rather than just calling this.close() because
         // DOM updates don't appear to work once the window is minimized.
         EventService.animate(EventService.animate(this.close.bind(this)))();
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

   listeners: [
      {
        model_: 'Method',
         name: 'addAttachment',
         code: function(_, _, file, id) {
           console.log('add attachment: ', file);
           var att = Attachment.create({
             id:       id,
             filename: file.name,
             type:     file.type,
             size:     file.size
           });
           console.log(att);
           this.email.attachments = this.email.attachments.concat(att);
         }
      }
   ],

  templates: [
    {
      name: "toHTML",
      template: "<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"foam.css\" /><link rel=\"stylesheet\" type=\"text/css\" href=\"quickcompose.css\" /><link rel=\"stylesheet\" type=\"text/css\" href=\"contacts.css\" /><title>Quick Message</title></head><body><% this.header(out); %><%= this.view.toHTML() %><% this.toolbar(out); %></body></html>"
    },
    {
      name: "header",
      template: "<table width=100% class=header><tr><td>Quick Message</td><td align=right><%= this.closeButton.toHTML() %></td></tr></table>"
    },
    {
      name: "toolbar",
      template: "<div class=toolbar><%= this.sendButton.toHTML(), this.boldButton.toHTML(), this.italicButton.toHTML(), this.underlineButton.toHTML(), this.linkButton.toHTML(), this.discardButton.toHTML() %></div>"
    }
  ]
});
