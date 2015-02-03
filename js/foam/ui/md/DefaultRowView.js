CLASS({
  name: 'DefaultRowView',
  package: 'foam.ui.md',
  extendsModel: 'View',

  imports: [ 'removeRowFromList' ],

  properties: [
    {
      name: 'data'
    },
    {
      name: 'className',
      defaultValue: 'DefaultRowView'
    }
  ],

  templates: [
    function CSS() {/*
      .DefaultRowView {
        white-space: nowrap;
      }
    */},
    function toInnerHTML() {/* %%data $$removeRow */}
  ],

  actions: [
    {
      name: 'removeRow',
      label: '',
      iconUrl: 'images/ic_clear_black_24dp.png',
      action: function() { this.removeRowFromList(this.data); }
    }
  ]

});
