/**
 * Material Design GMail.
 **/

/** Modify the default QueryParser so that label ids are looked up in the EMailLabels DAO. **/
var queryParser = {
  __proto__: QueryParserFactory(EMail),

  id: sym('string'),

  labelMatch: seq(alt('label','l'), alt(':', '='), sym('valueList'))
}.addActions({
  id: function(v) {
     return OR(
        CONTAINS_IC(EMail.TO, v),
        CONTAINS_IC(EMail.FROM, v),
        CONTAINS_IC(EMail.SUBJECT, v),
        CONTAINS_IC(EMail.BODY, v));
  },

  labelMatch: function(v) {
    var or = OR();
    var values = v[2];
    for ( var i = 0 ; i < values.length ; i++ ) {
      or.args.push(EQ(EMail.LABELS, values[i]))
    }
    return or;
  }
});

queryParser.expr = alt(
  sym('labelMatch'),
  queryParser.export('expr')
);


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
    { name: 'oauth' },
    {
      name: 'emailDao',
      type: 'DAO',
      factory: function() {
        return this.X.LimitedLiveCachingDAO.create({
          cacheLimit: 10,
          src: this.X.GMailToEMailDAO.create({
            delegate: this.X.GMailMessageDAO.create({})
//            delegate: this.X.StoreAndForwardDAO.create({
//              delegate: this.X.GMailMessageDAO.create({})
//            })
          }),
          cache: this.X.MDAO.create({ model: EMail })
        });
      }
    },
    {
      name: 'labelDao',
      type: 'DAO',
      factory: function() {
        return this.X.CachingDAO.create({
          src: this.X.GMailRestDAO.create({ model: GMailLabel }),
          cache: this.X.MDAO.create({ model: GMailLabel }),
        });
      }
    },
    {
      name: 'stack',
      subType: 'StackView',
      factory: function() { return this.X.StackView.create(); }
    }
  ],

  methods: {
    init: function() {
      this.X = this.X.sub({
        touchManager: this.X.TouchManager.create({})
      }, 'MGMAIL CONTEXT');

      this.oauth = this.X.EasyOAuth2.create({
        clientId: "945476427475-oaso9hq95r8lnbp2rruo888rl3hmfuf8.apps.googleusercontent.com",
        clientSecret: "GTkp929u268_SXAiHitESs-1",
        scopes: [
          "https://mail.google.com/"
        ]
      });

      this.X.registerModel(XHR.xbind({
        authAgent: this.oauth,
        retries: 3,
        delay: 10
      }), 'XHR');

      this.SUPER();
    },

    toHTML: function() { return this.stack.toHTML(); },

    initHTML: function() {
      this.stack.initHTML();

      var Y = this.X.sub({
        stack: this.stack,
        EMailDAO: this.emailDao,
        mgmail: this, // TODO: this doesn't actually work.
      }, 'GMAIL CONTEXT');

      this.controller = Y.AppController.create({
        model: EMail,
        dao: this.emailDao,
        createAction: this.model_.COMPOSE,
        citationView: 'EMailCitationView',
        queryParser: queryParser,
        editableCitationViews: true,
        sortChoices: [
          [ DESC(EMail.TIMESTAMP), 'Newest First' ],
          [ EMail.TIMESTAMP, 'Oldest First' ],
          [ EMail.SUBJECT, 'Subject' ],
        ],
        menuFactory: function() {
          return this.X.MenuView.create({
            daoListView: this.X.DAOListView.create({
              dao: this.X.mgmail.labelDao.orderBy(GMailLabel.TYPE, GMailLabel.NAME),
              rowView: 'MenuLabelCitationView',
            }),
          });
        }
      });
      this.changeLabel();
    },
    openEmail: function(email) {
      var v = this.controller.X.EMailView.create({data: email});
      this.stack.pushView(v, '');
    },
    changeLabel: function(label) {
      if (label) {
        this.controller.q = 'l:' + label.id;
        this.controller.name = label.name;
      } else {
        this.controller.q = '';
        this.controller.name = 'All Mail';
      }
      this.stack.back();
    },
  },

  actions: [
    {
      model_: 'Action',
      name: 'compose',
      label: '+',
      action: function() {
        var view = this.X.EMailComposeView.create({
          data: this.X.EMail.create({
            labels: ['DRAFT']
          })
        });
        this.X.stack.pushView(view, undefined, undefined, 'fromLeft');
      }
    }
  ]
});


MODEL({
  name: 'EMailView',
  extendsModel: 'UpdateDetailView',
  properties: [
  ],
  actions: [
    {
      name: 'back',
      isEnabled: function() { return true; },
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png'
    },
  ],
  templates: [
    function toHTML() {/*
      <div id="<%= this.id %>" class="email-view">
        <div class="header">
          $$back{className: 'backButton'}
          $$subject{mode: 'read-only', className: 'subject'}
          $$archive
          $$moveToInbox
          $$starred{
            model_: 'ImageBooleanView',
            className:  'actionButton',
            trueImage:  'images/ic_star_white_24dp.png',
            falseImage: 'images/ic_star_outline_white_24dp.png'
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
  extendsModel: 'View',
  properties: [
    {
      name: 'daoListView',
    },
  ],
  templates: [
    function toHTML() {/*
      <div class="menuView">
        %%daoListView
        <div id="<%= this.on('click', function() { this.X.mgmail.changeLabel(); }) %>">All Mail</div>
      </div>
    */}
   ]
});

MODEL({
  name: 'MenuLabelCitationView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      <div id="<%= this.on('click', function() { this.X.mgmail.changeLabel(this.data); }) %>">$$name{mode: 'read-only'}</div>
    */}
   ]
});
