/**
 * Mobile QuickBug.
 **/

MODEL({
  name: 'MGmail',
  description: 'Mobile Gmail',

  extendsModel: 'View',

  properties: [
    {
      name: 'controller',
      subType: 'AppController',
      postSet: function(_, controller) {
        var view = controller.X.DetailView.create({data: controller});
        this.stack.setTopView(view);
      }
    },
    {
      name: 'gmailSyncManager',
      type:  'GmailSyncManager',
      postSet: function(oldVal, newVal) {
        newVal.forceSync();
      }
    },
    {
      name: 'stack',
      subType: 'StackView',
      factory: function() { return StackView.create(); }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.X.touchManager = this.X.TouchManager.create({});
    },

    toHTML: function() { return this.stack.toHTML(); },

    initHTML: function() {
      this.stack.initHTML();

      var Y = this.X.sub({
        stack: this.stack,
        mgmail: this, // TODO: this doesn't actually work.
      }, 'GMAIL CONTEXT');

      this.controller = Y.AppController.create({
        name: 'Gmail API FOAM Demo',
        model: EMail,
        dao: this.gmailSyncManager.dstDAO,
        citationView: 'EMailCitationView',
        sortChoices: [
          [ DESC(EMail.TIMESTAMP), 'Date' ] // TODO: Sorting no work.
        ],
        filterChoices: [
          ['', 'All Mail'],
        ],
        menuFactory: function() {
          return this.X.MenuView.create({data: this.X.mgmail.gmailSyncManager});
        }
      });
    },
    openEmail: function(email) {
      var v = this.controller.X.EmailView.create({data: email});
      this.stack.pushView(v, '');
    },
  }
});

MODEL({
  name: 'EmailView',
  extendsModel: 'UpdateDetailView',
  properties: [
  ],
  actions: [
    {
      name: 'back',
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png'
    },
  ],
  templates: [
    function toHTML() {/*
      <div id="<%= this.id %>" class="email-view">
        <div class="header">
          $$back
          $$subject{mode: 'read-only', className: 'subject'}
          $$starred{
            model_: 'ImageBooleanView',
            className:  'star',
            trueImage:  'images/ic_star_24dp.png',
            falseImage: 'images/ic_star_outline_24dp.png'
          }
        </div>
        <div class="content">
          <div style='display: flex'>
            $$from{model_: 'MDMonogramStringView'}
            <div style='flex: 1'>
              $$from{mode: 'read-only', className: 'from', escapeHTML: true}
              <div class='details'>
                $$to{mode: 'read-only'}
                $$cc{mode: 'read-only'}
                <br>
                $$timestamp{ model_: 'RelativeDateTimeFieldView', mode: 'read-only', className: 'timestamp' }
              </div>
            </div>
          </div>
          $$body{ mode: 'read-only', className: 'body' }
        </div>
      </div>
    */}
  ]
});

MODEL({
  name: 'EMailCitationView',
  extendsModel: 'DetailView',
  properties: [
    { name: 'className', defaultValue: 'email-citation' }
  ],
  templates: [
    function toHTML() {/*
      <%
        // this.setClass('unread', function() { return self.data && self.data.unread; });
      %>

      <div id="<%= this.on('click', function() { this.X.mgmail.openEmail(this.data); }) %>" %%cssClassAttr() >
        $$from{model_: 'MDMonogramStringView'}
        <div style="flex: 1">
          <div style="display: flex">
            $$from{mode: 'read-only', className: 'from', escapeHTML: true}
            $$timestamp{ model_: 'RelativeDateTimeFieldView', mode: 'read-only', className: 'timestamp' }
          </div>
          <div style="display: flex">
            <div style='flex-grow: 1'>
              $$subject{mode: 'read-only', className: 'subject'}
              $$snippet{mode: 'read-only', className: 'snippet'}
              $$labels{mode: 'read-only', className: 'labels'}
            </div>
            $$starred{
              model_: 'ImageBooleanView',
              className:  'star',
              trueImage:  'images/ic_star_24dp.png',
              falseImage: 'images/ic_star_outline_24dp.png'
            }
          </div>
        </div>
      </div>
    */}
   ]
});

MODEL({
  name: 'MenuView',
  extendsModel: 'DetailView',

  templates: [ function toHTML() {/*
    <div id="<%= this.id %>">
      $$forceSync
    </div>
  */} ]
});
