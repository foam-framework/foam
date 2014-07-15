MODEL({
  name: 'MDMonogramStringView',
  extendsModel: 'View',
  properties: [
    { name: 'data', postSet: function() { this.updateHTML(); } },
    { name: 'className', defaultValue: 'monogram-string-view' }
  ],
  methods: {
    colors: 'e8ad62 9b26af 6639b6 4184f3 02a8f3 00bbd3 009587 0e9c57 9e9c57 8ac249 ccdb38 ffea3a f3b300 ff9700 ff5621 785447'.split(' '),
    generateColor: function() {
      if ( ! this.data ) return 'url(images/silhouette.png)';

      return '#' + this.colors[Math.abs(this.data.hashCode()) % this.colors.length];
    },
    updateHTML: function() {
      if ( this.$ ) this.$.style.background = this.generateColor();
      return this.SUPER();
    },
  },
  templates: [
    function toInnerHTML() {/* {{{this.data[0] && this.data[0].toUpperCase()}}} */},
    function toHTML() {/*
      <div id="<%= this.id %>" data-tip="<%= escapeHTML(this.data) %>" <%= this.cssClassAttr() %> style="background: <%= this.generateColor() %>"><%= this.toInnerHTML() %></div>
    */}
  ]
});
