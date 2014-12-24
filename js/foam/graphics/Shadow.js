CLASS({
  package: 'foam.graphics',
  name: 'Shadow',
  methods: {
    paint: function() {
      var c = this.canvas;
      var oldAlpha = this.alpha;
      var oldColor = this.color;

      c.save();
      c.translate(4, 4);
      this.alpha = 0.2;
      this.color = 'black';
      this.SUPER();
      c.restore();

      this.alpha = oldAlpha;
      this.color = oldColor;

      this.SUPER();
    }
  }
});
