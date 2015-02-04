CLASS({
  name: 'MonogramStringView',
  package: 'foam.ui.md',

  extendsModel: 'View',
  traits: ['foam.ui.md.ColoredBackgroundTrait'],

  properties: [
    { name: 'data',      postSet: function() { this.updateHTML(); } },
    { name: 'className', defaultValue: 'monogram-string-view' },
    { name: 'tooltip',   defaultValueFn: function() { return this.data; } }
  ],

  methods: {
    generateColor: function(data) {
      return data ? this.SUPER(data) : 'url(images/silhouette.png)';
    },
    updateHTML: function() {
      if ( this.$ ) this.$.style.background = this.generateColor(this.data);
      return this.SUPER();
    },
  },

  templates: [
    function CSS() {/*
      .monogram-string-view {
        -webkit-align-items: center;
        -webkit-flex-grow: 0;
        -webkit-justify-content: center;
        align-items: center;
        border-radius: 20px;
        border: 1px solid rgba(0,0,0,.1);
        color: #fff;
        display: -webkit-inline-flex;
        display: inline-flex;
        flex-grow: 0;
        font-size: 20px;
        height: 40px;
        justify-content: center;
        margin-right: 16px;
        overflow: hidden;
        padding-bottom: 2px;
        width: 40px;
      }
    */},
    function toInnerHTML() {/* {{{this.data[0] && this.data[0].toUpperCase() || '&nbsp;' }}} */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %> style="background: <%= this.generateColor(this.data) %>">
        <%= this.toInnerHTML() %>
      </div>
    */}
  ]

});
