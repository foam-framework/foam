CLASS({
  name: 'EMailView',
  package: 'com.google.mail',
  extendsModel: 'UpdateDetailView',
  properties: [
  ],
  actions: [
    {
      name: 'back',
      isAvailable: function() { return true; },
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png'
    },
    {
      name: 'moreActions',
      label: '',
      isEnabled: function() { return true; },
      iconUrl: 'icons/ic_more_horiz_white_24dp.png',
      action: function() {
        var actionSheet = this.X.ActionSheetView.create({
          data: this.data,
          actions: this.data.model_.actions,
        });
        this.X.stack.slideView(actionSheet);
      },
    },
  ],
  templates: [
    function CSS() {/*
      .actionButtonCView-moreActions {
        margin-right: 10px;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" class="email-view">
        <div class="header">
          $$back{radius: 22, className: 'backButton'}
          $$subject{mode: 'read-only', className: 'subject'}
          $$archive{iconUrl: 'icons/ic_archive_white_24dp.png'}
          $$moveToInbox{iconUrl: 'icons/ic_inbox_white_24dp.png'}
          $$trash{iconUrl: 'icons/ic_delete_white_24dp.png'}
          $$moreActions
        </div>
        <div class="content">
          <div style="display: flex; display: -webkit-flex">
            $$from{model_: 'MDMonogramStringView'}
            <div style='flex: 1; -webkit-flex: 1'>
              $$from{mode: 'read-only', className: 'from', escapeHTML: true}
              <div class='details'>
                $$to{mode: 'read-only'}
                $$cc{mode: 'read-only'}
                <br>
                $$timestamp{ model_: 'RelativeDateTimeFieldView', mode: 'read-only', className: 'timestamp' }
              </div>
            </div>
            $$starred{
              model_: 'ImageBooleanView',
              className:  'actionButton',
              trueImage:  'images/ic_star_24dp.png',
              falseImage: 'images/ic_star_outline_24dp.png'
            }
          </div>
          $$body{ mode: 'read-only', className: 'body', escapeHTML: false }
        </div>
      </div>
    */}
  ]
});
