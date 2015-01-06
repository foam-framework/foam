CLASS({
  name: 'DemoView',
  package: 'foam.ui.polymer.gen',
  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      postSet: function() {
        if ( this.data && this.data.create ) {
          this.instance = this.data.create({ content: 'Content' });
        }
      }
    },
    {
      name: 'instance'
    }
  ],

  templates: [
    function toHTML() {/*
      <% if ( this.instance ) { %>
        $$instance{ model_: 'DetailView' }
        <%= this.instance.toHTML() %>
      <% } %>
    */}
  ]
});
