CLASS({
  package: 'foam.demos.graphics',
  name:  'EyesCView',
  label: 'Eyes',

  extendsModel: 'foam.graphics.CView',
  
  requires: [ 'foam.demos.graphics.EyeCView' ],

  properties: [
    {
      name:  'leftEye',
      factory: function() {
        return this.EyeCView.create({x:65, y:85, r:50, color:'red'});
      }
    },
    {
      name:  'rightEye',
      factory: function() {
        return this.EyeCView.create({x:140, y:88, r:48, color:'yellow'});
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
