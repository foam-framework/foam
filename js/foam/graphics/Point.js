CLASS({
  package: 'foam.graphics',
  name: 'Point',
  package: 'canvas',

  properties: [
    {
      model_: 'IntProperty',
      name: 'x',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name: 'y',
      defaultValue: 0
    }
  ],

  methods: {
    toString: function() { return "canvas.Point("+this.x+", "+this.y+")"; }
  }
})
