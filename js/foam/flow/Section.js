CLASS({
  package: 'foam.flow',
  name: 'Section',
  extendsModel: 'View',

  imports: [ 'sections' ],

  properties: [
    {
      name: 'title'
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'inner'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.sections && this.sections.put(this);
    },

    /** Allow inner to be optional when defined using HTML. **/
    fromElement: function(e) {
      var children = e.children;
      if ( children.length == 1 && children[0].nodeName === 'inner' ) {
        return this.SUPER(e);
      }

      console.log('inner ********: ', e.innerHTML);
      this.inner = e.innerHTML;
      return this;
    }
  },

  templates: [
    function toHTML() {/*<div class="flow-section"><a name="section-%%title"></a><a href="#toc">%%title<!--<%= this.inner({}, this.X)%>-->%%inner</a></div>*/},
    function toDetailHTML() {/*<a href="#section-{{this.data.title}}">{{this.data.title}}</a><br>*/}
  ]
});
