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
      defaultValue: 50
    },
    {
      name:  'lid',
      type:  'Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({r: this.r, color: this.color});
      }
    },
    {
      name:  'white',
      type:  'Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({r: this.r-10, color: 'white'});
      }
    },
    {
      name:  'pupil',
      type:  'Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({r: 10, color: 'black'});
      }
    },
    { name: 'x',      defaultValueFn: function() { return 30 + this.r; } },
    { name: 'y',      defaultValueFn: function() { return ( 30 + this.r ) * 1.3; } },
    { name: 'width',  defaultValue: 150 },
    { name: 'height', defaultValue: 150 },
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
      // point pupil towards target
      if ( this.target_ )
        Movement.stepTowards(this.target_, this.pupil, this.r-26);

      this.canvas.translate(this.x, this.y);
      this.canvas.rotate(-Math.PI/40);
      this.canvas.scale(1.0, 1.3);
      this.canvas.translate(-this.x,-this.y);
    }
  }
});
