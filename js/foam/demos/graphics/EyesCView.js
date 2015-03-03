CLASS({
  package: 'foam.demos.graphics',
  name:  'EyesCView',
  label: 'Eyes',

  extendsModel: 'foam.graphics.CView',
  
  requires: [ 'foam.demos.graphics.EyeCView' ],

  properties: [
    {
      name: 'r',
      defaultValue: 50
    },
    {
      name:  'leftEye',
      factory: function() {
        return this.EyeCView.create({x:this.r * 65.0 / 50.0, y:85, r: this.r, color:'red'});
      }
    },
    {
      name:  'rightEye',
      factory: function() {
        return this.EyeCView.create({x:this.r * 65.0 / 50.0 + this.r * 75 / 50, y:88, r: 0.98 * this.r, color:'yellow'});
      }
    },
    { name: 'width',  defaultValue: 300 },
    { name: 'height', defaultValue: 200 },
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.rightEye);
      this.addChild(this.leftEye);
    },
    watch: function(target) {
      this.leftEye.watch(target);
      this.rightEye.watch(target);
    }
  }
});
