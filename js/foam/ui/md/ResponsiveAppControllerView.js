CLASS({
  package: 'foam.ui.md',
  name: 'ResponsiveAppControllerView',
  extendsModel: 'foam.ui.layout.ResponsiveView',

  requires: [
    'foam.ui.layout.ResponsiveViewOption',
    'foam.ui.md.TwoPane',
    'DetailView'
  ],

  properties: [
    {
      name: 'options',
      factory: function() {
        return [
          this.ResponsiveViewOption.create({
            controller: 'DetailView',
            minWidth: 0
          }),
          this.ResponsiveViewOption.create({
            controller: 'foam.ui.md.TwoPane',
            minWidth: 600
          })          
        ];
      }
    }
  ]
});
