CLASS({
  package: 'foam.demos.graphics',
  name:  'EyesCView',
  label: 'Eyes',

  extendsModel: 'foam.graphics.CView',
  
  requires: [ 'foam.demos.graphics.EyeCView' ],

  properties: [
    {
      name:  'leftEye',
      label: 'Left',
      type:  'Eye',
      factory: function() {
        return this.EyeCView.create({x:this.x+50,y:this.y+50,r:50,color:'red',parent:this});
      }
    },
    {
      name:  'rightEye',
      label: 'Right',
      type:  'Eye',
      factory: function() {
        return this.EyeCView.create({x:this.x+120,y:this.y+65,r:48,color:'yellow',parent:this});
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.leftEye);
      this.addChild(this.rightEye);
    },
    watch: function(target) {
      this.leftEye.watch(target);
      this.rightEye.watch(target);
    }
  }
});
