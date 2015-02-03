CLASS({
  name: 'DefaultACRowView',
  package: 'foam.ui.md',
  extendsModel: 'View',

  properties: [ 'data' ],

  templates: [
    function toInnerHTML() {/* %%data.id */}
  ]
});
