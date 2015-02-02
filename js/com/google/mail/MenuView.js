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
