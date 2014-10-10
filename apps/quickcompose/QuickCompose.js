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
function installImage(name, img) {
  RichTextView[name].iconUrl = '/images/' + img + '.svg';
  RichTextView[name].label   = '';
}
installImage('BOLD',                 'bold');
installImage('ITALIC',               'italics');
installImage('UNDERLINE',            'underline');
installImage('LINK',                 'insert_link');
installImage('LEFT_JUSTIFY',         'text_align_left');
installImage('CENTER_JUSTIFY',       'text_align_center');
installImage('RIGHT_JUSTIFY',        'text_align_right');
installImage('NUMBERED_LIST',        'list_numbered');
installImage('BULLET_LIST',          'list_bulleted');
installImage('DECREASE_INDENTATION', 'outdent');
installImage('INCREASE_INDENTATION', 'indent');
installImage('BLOCK_QUOTE',          'quote_text');


var AttachmentView = FOAM({
  model_: 'Model',
  extendsModel: 'View',

  name: 'AttachmentView',

  properties: [
    {
      name: 'data',
      postSet: function() { this.redraw(); }
    }
  ],

  listeners: [
    {
      model_: 'Method',
      name: 'onRemove',
      code: function(attr) {
        this.data = this.data.removeF(EQ(Attachment.ID, attr.id));
      }
    }
  ],

  methods: {
    toHTML: function() {
      return '<div id="' + this.id + '" class="attachments"></div>';
    },

    initHTML: function() {
      this.redraw();
    },

    toInnerHTML: function() {
      this.$.style.display = this.data.length ? 'block' : 'none';

      var out = "";

      for ( var i = 0 ; i < this.data.length ; i++ ) {
        var att = this.data[i];
        var size = '(' + Math.round(att.size/1000).toLocaleString() + 'k)';
        out += '<div class="attachment"><div class="filenameandsize"><span class="filename">' + this.strToHTML(att.filename) + '</span><span class="size">' + size + '</span></div><span class="spacer"/><span class="remove"><button id="' + this.on('click', this.onRemove.bind(this, att)) + '" tabindex="99"><img src="images/x_8px.png"></button></span></div>';
      }

      return out;
    },

    redraw: function() {
      this.$.innerHTML = this.toInnerHTML();
      this.invokeInitializers();
    }
  }
});


var ContactView = {
        // TODO: Fetch dependencies via context.
        create: function(prop) {
          return ListValueView.create({
            inputView: ListInputView.create({
              name: prop.name,
              dao: ContactAvatarDAO,
              property: Contact.EMAIL,
              placeholder: prop.name.capitalize(),
              searchProperties: [Contact.EMAIL, Contact.FIRST, Contact.LAST, Contact.TITLE],
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
};

var QuickEMail = FOAM({
  model_: 'Model',
  extendsModel: 'EMail',
  name: 'QuickEMail',
  properties: [
    { name: 'to',  displayWidth: 55, view: ContactView },
    { name: 'cc',  displayWidth: 55, view: ContactView },
    { name: 'bcc', displayWidth: 55, view: ContactView },
    { name: 'subject',     displayWidth: 55, view: { model_: 'TextFieldView', placeholder: 'Subject', onKeyMode: true } },
    { name: 'attachments', view: 'AttachmentView' },
    { name: 'body',        view: { model_: 'RichTextView', height: 100, onKeyMode: true, placeholder: 'Message' } }
  ]
});

// Create a dummy email so that the parent properties get constantized properly.
QuickEMail.create({});

var QuickEMailView = Model.create({
  name: 'QuickEMailView',

  extendsModel: 'DetailView',

  properties: [
    {
      name: 'isFull',
      help: 'Determines if the full compose window is to be shown with cc and bcc fields.',
      defaultValue: false
    }
  ],

  templates: [
    {
      name: "toFullHTML",
    },
    {
      name: "toSimpleHTML",
      template: '$$to $$subject $$body $$attachments'
    }
  ],

  methods: {
    toHTML: function() {
      return this.isFull ? this.toFullHTML() : this.toSimpleHTML();
    }
  }
});


var QuickCompose = FOAM({
  model_: 'Model',

  name: 'QuickCompose',

  extendsModel: 'View',

  properties: [
    {
      name: 'window'
    },
    {
      name: 'userInfo'
    },
    {
      name: 'email',
      factory: function() {
        // TODO: Look for a draft in the EMailDAO
        return QuickEMail.create({from: this.userInfo.email, id: Date.now()});
      }
    },
    {
      name: 'view',
      factory: function() {
        return this.__ctx__.QuickEMailView.create({
          model: QuickEMail,
          isFull: this.isFull
        });
      }
    },
    {
      name: 'minimizeButton',
      factory: function() { return ActionButton.create({action: this.model_.MINIMIZE, data: this}); }
    },
    {
      name: 'closeButton',
      factory: function() { return ActionButton.create({action: this.model_.CLOSE, data: this}); }
    },
    {
      name: 'isFull',
      help: 'Determines if the full compose window is to be shown with cc and bcc fields.',
      defaultValue: false
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

      this.SUPER();

      this.closeButton.$.tabIndex = -1;
      this.minimizeButton.$.tabIndex = -1;

      this.view.bodyView.subscribe('attachmentAdded', this.addAttachment);

      // Remove images when their attachments are removed.
      this.email.propertyValue('attachments').addListener(function(_, _, oldAtts, newAtts) {
         for ( var i = 0 ; i < oldAtts.length ; i++ ) {
           var a = oldAtts[i];
           newAtts.find(a.id, {error: function() {
             this.view.bodyView.removeImage(a.id);
           }.bind(this)});
         }
      }.bind(this));

      this.window.document.addEventListener('keyup', this.keyUp);
      this.view.bodyView.$.contentDocument.addEventListener('keyup', this.keyUp);

      this.window.document.addEventListener('keypress', this.keyPress);
      this.view.bodyView.$.contentDocument.addEventListener('keypress', this.keyPress);

      this.view.toView.inputView.$.focus();
    }
  },

   actions: [
     {
       name:  'send',
       help:  'Send (Ctrl-Enter)',

       isEnabled: function() {
         var email   = this.email;
         var length  = email.to.length;
         var subject = email.subject;
         var body    = email.body;
         return length && ( subject || body );
       },
       action: function() {
         this.email.timestamp = new Date();
         this.EMailDAO.put(this.email);
         this.window.close();
       }
     },
     {
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
         EventService.framed(EventService.framed(this.close.bind(this)))();
       }
     },
     {
       name:  'close',
       label: '',
       iconUrl: 'images/window_control_icon_flat_close.png',
       // help:  'Discard & Close',

       action: function() {
         this.appWindow.close();
       }
     },
     {
       name:  'minimize',
       label: '',
       iconUrl: 'images/window_control_icon_flat_minimize.png',
       // help:  'Minimize',

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
             file:     file,
             filename: file.name,
             type:     file.type,
             size:     file.size
           });
           console.log(att);
           this.email.attachments = this.email.attachments.concat(att);
         }
      },
      {
        model_: 'Method',
        name: 'keyUp',
        code: function(e) {
          if ( e.shiftKey && e.ctrlKey ) {
            var action = {
               55: RichTextView.NUMBERED_LIST,
               56: RichTextView.BULLET_LIST,
              219: RichTextView.DECREASE_INDENTATION,
              221: RichTextView.INCREASE_INDENTATION,
               57: RichTextView.BLOCK_QUOTE,
               87: RichTextView.LEFT_JUSTIFY,
               69: RichTextView.CENTER_JUSTIFY,
               82: RichTextView.RIGHT_JUSTIFY,
               48: RichTextView.REMOVE_FORMATTING
            }[e.keyCode];

            if ( action ) action.action.apply(this.view.bodyView);
          }
          if ( e.keyCode == 27 /* Esc */ ) this.minimize();
        }
      },
      {
        model_: 'Method',
        name: 'keyPress',
        code: function(e) {
          if ( e.ctrlKey && e.keyCode == 10 /* Ctrl-Enter */ ) this.send();
          if ( e.ctrlKey && e.keyCode == 11 /* Ctrl-K     */ ) RichTextView.LINK.action.call(this.view.bodyView);
        }
      }
   ],

  templates: [
    {
      name: "toHTML",
      template: "<head><link rel=\"stylesheet\" type=\"text/css\" href=\"foam.css\" /><link rel=\"stylesheet\" type=\"text/css\" href=\"quickcompose.css\" /><link rel=\"stylesheet\" type=\"text/css\" href=\"contacts.css\" /><title>Quick Message</title></head><body><% this.header(out); %>%%view <% this.toolbar(out); %></body>"
    },
    {
      name: "header",
      template: "<div id=\"header\">%%minimizeButton %%closeButton</div>"
    },
    {
      name: "toolbar"
    }
  ]
});
