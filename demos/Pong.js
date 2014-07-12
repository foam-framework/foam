MODEL({
  name: 'Ball',
  extendsModel: 'Circle2',
  traits: ['Physical', 'MotionBlur']
});


MODEL({
  name: 'Paddle',
  extendsModel: 'Circle2',

  traits: ['Shadow'],

  properties: [
    { name: 'color', defaultValue: 'white' },
    { name: 'r',     defaultValue: 30 }
  ]
});


MODEL({
  name: 'PaddleCollider',
  extendsModel: 'Collider',

  properties: [ 'pong' ],

  methods: {
    collide: function(o1, o2) {
      var lx = this.pong.lPaddle.x;
      var rx = this.pong.rPaddle.x;
      this.SUPER(o1, o2);
      this.pong.lPaddle.x = lx;
      this.pong.rPaddle.x = rx;
    }
  }
});

    
MODEL({
  name: 'Pong',

  properties: [
    {
      name: 'WIDTH',
      defaultValue: 800
    },
    {
      name: 'HEIGHT',
      defaultValue: 300
    },
    {
      name: 'table',
      factory: function() {
        return CView2.create({background: 'lightgray', width: this.WIDTH, height: this.HEIGHT});
      }
    },
    {
      name: 'ball',
      factory: function() { return Ball.create({color: 'white', r: 20}); }
    },
    {
      name: 'lPaddle',
      factory: function() { return Paddle.create(); }
    },
    {
      name: 'rPaddle',
      factory: function() { return Paddle.create(); }
    },
    {
      model_: 'IntProperty',
      name: 'lScore'
    },
    {
      model_: 'IntProperty',
      name: 'rScore'
    }
  ],

  listeners: [
    {
      name: 'onBallMove',
      isAnimated: true,
      code: function() {
        if ( this.ball.y + this.ball.r >= this.HEIGHT ) this.ball.vy *= -1;
        if ( this.ball.y - this.ball.r <= 0           ) this.ball.vy *= -1;
        if ( this.ball.x >= this.WIDTH ) {
          this.lScore++;
          this.ball.vx *= -1;
        }
        if ( this.ball.x <= 0 ) {
          this.rScore++;
          this.ball.vx *= -1;
        }
      }
    }
  ],

  actions: [
    {
      name: 'lUp',
      action: function() { this.lPaddle.y -= 4; }
    },
    {
      name: 'lDown',
      action: function() { this.lPaddle.y += 4; }
    },
    {
      name: 'rUp',
      action: function() { this.rPaddle.y -= 4; }
    },
    {
      name: 'rDown',
      action: function() { this.rPaddle.y += 4; }
    }
  ],

  templates: [
    function toDetailHTML() {/*
      $$lScore{mode: 'read-only'} $$rScore{mode: 'read-only'} <br> %%obj.table
    */}
  ],

  methods: {
    toHTML: function() {
      this.view = DetailView.create({data: this, showActions: true});
      return this.view.toHTML();
    },
    initHTML: function() {
      this.view.initHTML();
      this.lPaddle.x = 30+this.lPaddle.r;
      this.rPaddle.x = this.WIDTH-30-this.rPaddle.r;
      this.lPaddle.y = this.rPaddle.y = (this.HEIGHT-this.rPaddle.height)/2;

      Movement.inertia(this.ball);

      this.ball.x = this.ball.y = 50;
      this.ball.vx = 3;
      this.ball.vy = 3;

      this.table.addChildren(
        this.ball,
        this.lPaddle,
        this.rPaddle);

      this.ball.x$.addListener(this.onBallMove);

      var collider = PaddleCollider.create({pong: this});
      collider.add(this.ball);
      collider.add(this.lPaddle);
      collider.add(this.rPaddle);
      collider.start();

      this.table.paint();
    }
  }
});
