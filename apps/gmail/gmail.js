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
      name: 'emailDao',
      type:  'DAO',
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
        dao: this.emailDao,
        citationView: 'EMailCitationView',
          sortChoices: [
            [ DESC(EMail.TIMESTAMP), 'Date' ] // TODO: Sorting no work.
          ],
          filterChoices: [
            ['', 'All Mail'],
          ],
          menuFactory: function() {
            return this.X.StaticHTML.create({content: 'Hello world'});
          }
        });
    },
    openEmail: function(email) {
      alert(email.body);
    },
  }
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
