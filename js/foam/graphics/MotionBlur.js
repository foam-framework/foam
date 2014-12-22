CLASS({
  package: 'foam.graphics',
  name: 'MotionBlur',
  methods: {
    paint: function() {
      this.SUPER();
      var c = this.canvas;
      var oldAlpha = this.alpha;

      c.save();
      c.translate(-this.vx, -this.vy);
      this.alpha = 0.6;
      this.SUPER();
      c.translate(-this.vx, -this.vy);
      this.alpha = 0.3;
      this.SUPER();
      c.restore();

      this.alpha = oldAlpha;
    }
  }
});
