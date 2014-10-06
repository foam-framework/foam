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
    function toHTML() {/*
      <div id="<%= this.id %>" class="email-compose-view">
        <div class="header">
          $$back{className: 'backButton'}
          $$subject{mode: 'read-only', className: 'subject'}
        </div>
        <div class="content">
        $$to{placeholder: 'To'} $$cc{placeholder: 'Cc'} $$bcc{placeholder: 'Bcc'} $$subject{ placeholder: 'Subject' } $$body{model_: 'RichTextView', height: 300, placeholder: 'Message' }
        </div>
        $$send
      </div>
    */}
  ]
});
