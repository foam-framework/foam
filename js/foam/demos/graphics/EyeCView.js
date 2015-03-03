CLASS({
  package: 'foam.demos.graphics',
  name:  'EyeCView',
  label: 'Eye',

  extendsModel: 'foam.graphics.CView',

  requires: [ 'foam.graphics.Circle' ],

  properties: [
    {
      name:  'color',
      type:  'String',
      defaultValue: 'red'
    },
    {
      model_: 'IntProperty',
      name:  'r',
      label: 'Radius',
      defaultValue: 100
    },
    {
      name:  'lid',
      type:  'Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({x:this.x,y:this.y,r:this.r,color:this.color,parent:this});
      }
    },
    {
      name:  'white',
      type:  'Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({x:this.x,y:this.y,r:this.r-10,color:'white',parent:this});
      }
    },
    {
      name:  'pupil',
      type:  'Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({x:this.x,y:this.y,r:10,color:'black',parent:this});
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.lid);
      this.addChild(this.white);
      this.addChild(this.pupil);
    },
    watch: function(target) { this.target_ = target; },
    paintSelf: function() {
      this.pupil.x = this.lid.x = this.white.x = this.x;
      this.pupil.y = this.lid.y = this.white.y = this.y;

      // point pupil towards target
      if ( this.target_ )
        Movement.stepTowards(this.target_, this.pupil, this.r-26);

 //     this.canvas.save();
      this.canvas.translate(this.x,this.y);
      this.canvas.rotate(-Math.PI/100);
      this.canvas.scale(1.0,1.3);
      this.canvas.translate(-this.x,-this.y);

//      this.canvas.restore();
    }
  }
});
