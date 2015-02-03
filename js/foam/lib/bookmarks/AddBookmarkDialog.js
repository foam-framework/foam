CLASS({
  name: 'AddBookmarkDialog',
  package: 'foam.lib.bookmarks',

  extendsModel: 'DetailView',

  properties: [
    {
      model_: 'DAOProperty',
      name: 'dao'
    }
  ],

  actions: [
    {
      name: 'add',
      help: 'Add Bookmark (Ctrl-A)',
      isEnabled: function() { return this.data.title; },
      action: function () {
        this.$.remove();
        this.dao.put(this.data);
      }
    },
    {
      name: 'cancel',
      help: 'Cancel (Ctrl-C)',
      action: function () { this.$.remove(); }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      this.titleView.focus();
    }
  },

  templates: [
    function toHTML() {/*
      <div id="%%id" class="LinkDialog" style="position:absolute">
        <table><tr>
        <th>Text</th><td>$$title{onKeyMode: true}</td></tr><tr>
        <th>Link</th><td>$$url</td>
        <tr><td colspan=2 align=right>$$add $$cancel</td>
        </tr></table>
      </div>
    */}
  ]
});
