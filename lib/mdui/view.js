MODEL({
  name: 'ColoredBackgroundTrait',
  methods: {
    colors: 'e8ad62 9b26af 6639b6 4184f3 02a8f3 00bbd3 009587 0e9c57 9e9c57 8ac249 ccdb38 ffea3a f3b300 ff9700 ff5621 785447'.split(' '),
    generateColor: function(data) {
      return '#' + this.colors[Math.abs(data.hashCode()) % this.colors.length];
    },
    generateColorStyle: function(data) { return ' style="background:' + this.generateColor(data) + ';"'; }
  }
});


MODEL({
  name: 'MDMonogramStringView',

  extendsModel: 'View',
  traits: ['ColoredBackgroundTrait'],

  properties: [
    { name: 'data',      postSet: function() { this.updateHTML(); } },
    { name: 'className', defaultValue: 'monogram-string-view' },
    { name: 'tooltip',   defaultValueFn: function() { return this.data; } }
  ],

  methods: {
    generateColor: function(SUPER, data) {
      return data ? SUPER(data) : 'url(images/silhouette.png)';
    },
    updateHTML: function(SUPER) {
      if ( this.$ ) this.$.style.background = this.generateColor(this.data);
      return SUPER();
    },
  },

  templates: [
    function toInnerHTML() {/* {{{this.data[0] && this.data[0].toUpperCase()}}} */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %> style="background: <%= this.generateColor(this.data) %>">
        <%= this.toInnerHTML() %>
      </div>
    */}
  ]

});
