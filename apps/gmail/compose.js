MODEL({
  name: 'EMailComposeView',
  extendsModel: 'DetailView',

  actions: [
    {
      name: 'back',
      isEnabled: function() { return true; },
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png',
      action: function() { this.X.stack.back(); }
    },
  ],

  templates: [
    function CSS() {/*
      .actionButtonCView-send {
        float: right;
        margin-top: -64px;
        margin-right: 32px;
      }
      iframe {
        border: none;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" class="email-compose-view">
        <div class="header">
          $$back{className: 'backButton'}
          $$subject{mode: 'read-only', className: 'subject'}
        </div>
        <div class="content">
        $$to{ model_: 'ContactView', placeholder: 'To'} <br>
        $$cc{ model_: 'ContactView', placeholder: 'Cc'} <br>
        $$bcc{ model_: 'ContactView', placeholder: 'Bcc'} <br>
        $$subject{ placeholder: 'Subject' }
        $$body{model_: 'ToolbarRichTextView', height: 300, placeholder: 'Message'}
        </div>
        $$send{background: '#259b24', radius: 24, iconUrl: 'images/send.png'}
      </div>
    */}
  ]
});

MODEL({
  name: 'ContactView',
  extendsModel: 'ListValueView',
  imports: [
    'ContactAvatarDAO'
  ],
  requires: [
    'ArrayTileView',
    'AutocompleteListView',
    'Contact',
    'ContactListTileView',
    'ContactSmallTileView',
    'DefaultObjectDAO',
  ],
  properties: [
    {
      name: 'name',
      documentation: 'Set to the name of the property of interest by PropertyView.'
    },
    {
      name: 'inputView',
      factory: function() {
        return this.ListInputView.create({
          name: this.name,
          dao: this.ContactAvatarDAO,
          property: this.Contact.EMAIL,
          placeholder: this.name.capitalize(),
          searchProperties: [
            this.Contact.EMAIL,
            this.Contact.FIRST,
            this.Contact.LAST,
            this.Contact.TITLE
          ],
          autocompleteView: this.AutocompleteListView.create({
            innerView: this.ContactListTileView,
            count: 8
          })
        });
      }
    },
    {
      name: 'valueView',
      factory: function() {
        return this.ArrayTileView({
          dao: this.DefaultObjectDAO({
            delegate: this.ContactAvatarDAO,
            factory: function(q) {
              var obj = this.Contact({});
              obj[q.arg1.name] = q.arg2.arg1;
              return obj;
            }
          }),
          property: this.Contact.EMAIL,
          tileView: this.ContactSmallTileView
        });
      }
    }
  ]
});

