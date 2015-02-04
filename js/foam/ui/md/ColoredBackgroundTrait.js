CLASS({
  name: 'ColoredBackgroundTrait',
  package: 'foam.ui.md',
  properties: [
    {
      name: 'colors',
      defaultValue: 'e8ad62 9b26af 6639b6 4184f3 02a8f3 00bbd3 009587 0e9c57 9e9c57 8ac249 ccdb38 ffea3a f3b300 ff9700 ff5621 785447'.split(' ')
    }
  ],
  methods: {
    generateColor: function(data) {
      return '#' + this.colors[Math.abs(data.hashCode()) % this.colors.length];
    },
    generateColorStyle: function(data) { return ' style="background:' + this.generateColor(data) + ';"'; }
  }
});
