/**
 * Material Design GMail.
 **/


CLASS({
  name: 'GMailUserInfo',
  package: 'com.google.mail',
  properties: ['email', 'name', 'avatarUrl'],
  methods: {
    fromJSON: function(obj) {
      this.email = obj.email;
      this.name = obj.name;
      this.avatarUrl = obj.picture + '?sz=50';
    }
  }
});


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
            $$from{model_: 'foam.ui.md.MonogramStringView'}
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


CLASS({
  name: 'EMailCitationView',
  package: 'com.google.mail',
  extendsModel: 'DetailView',
  imports: [
    'controller'
  ],
  properties: [
    { name: 'className', defaultValue: 'email-citation' },
    {
      name: 'preferredHeight',
      help: 'Specifying the preferred height of this view for the ScrollView, since an empty row is too small.',
      defaultValue: 82
    }
  ],
  templates: [
    function CSS() {/*
      .email-citation {
        display: flex;
        display: -webkit-flex;
        border-bottom: solid #B5B5B5 1px;
        padding: 10px 14px 10px 6px;
      }

      .email-citation.unread {
        font-weight: bold;
      }

      .email-citation .from {
        display: block;
        font-size: 17px;
        line-height: 24px;
        white-space: nowrap;
        overflow-x:hidden;
        text-overflow: ellipsis;
        flex-grow: 1;
        -webkit-flex-grow: 1;
      }

      .email-citation .timestamp {
        font-size: 12px;
        color: rgb(17, 85, 204);
        white-space: nowrap;
        flex-shrink: 0;
        -webkit-flex-shrink: 0;
      }

      .email-citation .subject {
        display: block;
        font-size: 13px;
        line-height: 17px;
        overflow-x:hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .email-citation .snippet {
        color: rgb(119, 119, 119);
        display: block;
        font-size: 13px;
        height: 20px;
        overflow-x: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .email-citation .monogram-string-view {
        margin: auto 6px auto 0;
      }
    */},
    function toHTML() {/*
      <%
        var id = this.setClass('unread', function() { return self.data && self.data.unread; }, this.id);
        this.on('click', function() { this.controller.open(this.data.id); }, this.id);
      %>

      <div id="<%= id %>" %%cssClassAttr() >
        $$from{model_: 'foam.ui.md.MonogramStringView'}
        <div style="flex: 1; -webkit-flex: 1">
          <div style="display: flex; display: -webkit-flex">
            $$from{mode: 'read-only', className: 'from', escapeHTML: true}
            $$timestamp{ model_: 'RelativeDateTimeFieldView', mode: 'read-only', className: 'timestamp' }
          </div>
          <div style="display: flex; display: -webkit-flex">
            <div style='flex-grow: 1; -webkit-flex-grow: 1'>
              $$subject{mode: 'read-only', className: 'subject'}
              $$snippet{mode: 'read-only', className: 'snippet'}
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

CLASS({
  name: 'ProfileView',
  package: 'com.google.mail',
  extendsModel: 'DetailView',
  requires: ['com.google.mail.GMailUserInfo'],
  properties: [
    {
      model_: 'ModelProperty',
      name: 'model',
      factory: function() { return this.GMailUserInfo; }
    }
  ],
  templates: [
    function toHTML() {/*
      <div id="%%id">
        $$avatarUrl{ model_: 'ImageView' }
        $$name{ mode: 'read-only',  extraClassName: 'name' }
        $$email{ mode: 'read-only', extraClassName: 'email' }
      </div>
    */}
  ]
});

CLASS({
  name: 'MenuView',
  package: 'com.google.mail',
  extendsModel: 'View',
  
  traits: ['PositionedDOMViewTrait'],
  requires: [
    'com.google.mail.MenuLabelCitationView',
    'com.google.mail.FOAMGMailLabel',
    'com.google.mail.ProfileView',
    'foam.lib.email.EMail'
  ],
  imports: [
    'profile$',
    'EMailDAO'
  ],
  exports: ['counts'],
  properties: [
    {
      name: 'topSystemLabelDAO',
      view: { factory_: 'DAOListView', rowView: 'com.google.mail.MenuLabelCitationView' }
    },
    {
      name: 'bottomSystemLabelDAO',
      view: { factory_: 'DAOListView', rowView: 'com.google.mail.MenuLabelCitationView' }
    },
    {
      name: 'userLabelDAO',
      view: { factory_: 'DAOListView', rowView: 'com.google.mail.MenuLabelCitationView' }
    },
    {
      name: 'preferredWidth',
      defaultValue: 280
    },
    {
      name: 'counts',
      factory: function() {
        var sink = GROUP_BY(this.EMail.LABELS, COUNT());
        this.EMailDAO.select(sink);
        return sink;
      }
    }
  ],
  templates: [
    function toInnerHTML() {/*
      <div class="menuView">
        <div class="menuHeader">
          <%= this.ProfileView.create({ data$: this.profile$ }) %>
        </div>
        $$topSystemLabelDAO
        <hr>
        $$bottomSystemLabelDAO
        <hr>
        <%= this.MenuLabelCitationView.create({
          data: this.FOAMGMailLabel.create({
            id: 'All Mail',
            name: 'All Mail'
          })
        }) %>
        $$userLabelDAO
      </div>
    */},
    function CSS() {/*
      .menuView {
        height: 100%;
        display: block;
        overflow-y: auto;
        background: white;
      }

      .menuHeader {
        background: #db4437;
        box-shadow: 0 3px 6px #888;
        color: white;
        padding: 10px 0 8px 15px;
      }
      .menuHeader:hover {
        background: #db4437 !important;
      }

      .menuHeader img {
        border-radius: 50%;
        margin-bottom: 15px;
      }

      .menuHeader .name {
        font-weight: bold;
      }

      .menuView div:hover {
        background: #e0e0e0;
      }
   */}
  ]
});


CLASS({
  name: 'MenuLabelCitationView',
  package: 'com.google.mail',
  extendsModel: 'DetailView',
  requires: ['SimpleValue'],
  imports: [
    'counts',
    'controller'
  ],
  properties: [
    {
      name: 'count',
      view: { factory_: 'TextFieldView', mode: 'read-only', extraClassName: 'count' }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      if ( this.counts.groups[this.data.name] ) this.bindGroup();
      else this.bindCounts();
    },
    bindCounts: function() {
      this.counts.addListener(this.bindGroup);
    }
  },
  listeners: [
    {
      name: 'bindGroup',
      code: function() {
        if ( this.counts.groups[this.data.name] ) {
          this.counts.removeListener(this.bindGroup);
          this.counts.groups[this.data.name].addListener(this.updateCount);
          this.updateCount();
        }
      }
    },
    {
      name: 'updateCount',
      code: function() {
        if ( this.counts.groups[this.data.name] )
          this.count = this.counts.groups[this.data.name].count;
      }
    }
  ],
  templates: [
    function CSS() {/*
      .label-row {
        height: 42px;
        line-height: 42px;
        padding-left: 15px;
        display: flex;
        align-items: center;
      }
      .label-row img {
        height: 24px;
        width: 24px;
        opacity: 0.6;
        margin-right: 25px;
        flex-grow: 0;
        flex-shrink: 0;
      }
      .label-row .label {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .label-row .count {
        flex-grow: 0;
        flex-shrink: 0;
        margin-right: 10px;
        text-align: center;
        text-align: right;
        width: 40px;
      }
    */},
    function toHTML() {/*
      <div id="%%id" class="label-row">
        $$iconUrl
        $$label{mode: 'read-only', extraClassName: 'label' }
        $$count
      </div>
      <% this.on('click', function() { this.controller.changeLabel(this.data); }, this.id); %>
    */}
  ]
});
