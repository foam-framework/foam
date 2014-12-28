CLASS({
  name: 'EMailComposeView',
  extendsModel: 'DetailView',

  requires: [
    'mdTextFieldView as TextFieldView',
  ],

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
      .email-compose-view {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .content {
        margin-left: 16px;
        margin-top: 44px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        position: relative;
       }

      .richText {
        flex-grow: 1;
        margin-top: 30px;
        margin-left: -2px;
      }

      .richText .placeholder { font-size: 14px; font-family: Roboto; }

      iframe {
        border: none;
      }

      .actionButtonCView-send {
        position: absolute;
        bottom: 10px;
        right: 24px;
        box-shadow: 3px 3px 3px #aaa;
        border-radius: 30px;
      }

      .md-text-field-container {
        height: 68p x;
        margin-left: -12px;
        margin-top: -18px;
        margin-bottom: -8px;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" class="email-compose-view">
        <div class="header">
          $$back{className: 'backButton'}
          $$subject{mode: 'read-only', className: 'subject'}
        </div>
        <div class="content">
        $$to{placeholder: 'To', model_: 'mdTextFieldView'} <br>
        $$cc{placeholder: 'Cc', model_: 'mdTextFieldView'} <br>
        $$bcc{placeholder: 'Bcc', model_: 'mdTextFieldView'} <br>
        $$subject{ placeholder: 'Subject', onKeyMode: true, model_: 'mdTextFieldView'}
        $$body{model_: 'ToolbarRichTextView', height: 300, placeholder: 'Message'}
        </div>
        $$send{background: '#259b24', radius: 24, iconUrl: 'images/send.png'}
      </div>
    */}
  ]
});
