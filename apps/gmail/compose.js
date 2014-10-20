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
        $$to{placeholder: 'To'} <br>
        $$cc{placeholder: 'Cc'} <br>
        $$bcc{placeholder: 'Bcc'} <br>
        $$subject{ placeholder: 'Subject' }
        $$body{model_: 'ToolbarRichTextView', height: 300, placeholder: 'Message'}
        </div>
        $$send{background: '#259b24', radius: 24, iconUrl: 'images/send.png'}
      </div>
    */}
  ]
});
