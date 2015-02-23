CLASS({
  package: 'foam.flow',
  name: 'Section',
  extendsModel: 'View',

  imports: [ 'parentSection' ],
  exports: [ 'as parentSection' ],

  properties: [
    {
      name: 'ordinal',
      defaultValue: ''
    },
    {
      name: 'title'
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'inner'
    },
    {
      model_: 'DAOProperty',
      name: 'subSections',
      view: 'DAOListView',
      factory: function() { return []; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.parentSection && this.parentSection.addSubSection(this);
    },

    /** Allow inner to be optional when defined using HTML. **/
    fromElement: function(e) {
      var children = e.children;
      if ( children.length == 1 && children[0].nodeName === 'inner' ) {
        return this.SUPER(e);
      }

      this.inner = e.innerHTML;
      return this;
    },

    addSubSection: function(section) {
      this.subSections.push(section);
      section.ordinal = this.ordinal + this.subSections.length + '.';
    }
  },

  templates: [
    function CSS() {/*
      .flow-section-header {
        font-size: 16px;
        margin-top: 18px;
      }
      .flow-section-header a {
        text-decoration-line: none;
       }
      .flow-section-body {
        margin: 18px;
      }
    */},
    function toHTML() {/*
      <div class="flow-section">
        <div class="flow-section-header">
          <a name="section-%%ordinal"></a><a href="#toc">%%ordinal %%title</a>
        </div>
        <div class="flow-section-body">
          <%= this.inner() %>
        </div>
      </div>
    */},
    function toDetailHTML() {/*
      <a href="#section-{{this.data.ordinal}}">{{this.data.ordinal}} {{this.data.title}}</a><br>
      <blockquote>
        $$subSections{mode: 'read-only'}
      </blockquote>
    */}
  ]
});
