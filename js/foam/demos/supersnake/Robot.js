CLASS({
  package: 'foam.demos.supersnake',
  name: 'Robot',
  extendsModel: 'foam.graphics.CView',
  requires: [
    'foam.util.Timer',
    'foam.graphics.Circle',
    'foam.graphics.SimpleRectangle as Rectangle'
  ],
  methods: [
    function init() {
      this.SUPER();
        
      var engine = this.Circle.create();
      engine.r = 8;
      engine.color = 'red';
      engine.x = 10;
      engine.y=30;
      this.addChild(engine);

        var neck1 =this.Rectangle.create();
        neck1.background = 'black';
        neck1.width =2;
        neck1.y = -13;
        neck1.x = 9;
        neck1.height = 15;
        this.addChild(neck1);
        
      var head = this.Circle.create();
      head.r = 8;
      head.color = 'purple';
      head.x = 0;
      head.y=-5;
      neck1.addChild(head);

      var body = this.Rectangle.create();
      body.width = 20;
      body.height = 30;
      body.background = 'yellow';
      this.addChild(body);
        
      var eye =this.Circle.create();
        eye.r=5;
        eye.color='white';
      head.addChild(eye);
        
        var pupil =this.Circle.create();
        eye.addChild(pupil);
        pupil.r=2;
        pupil.color='lightblue';
        
        // animate
        var robot = this;
        var timer = this.Timer.create();
        timer.time$.addListener(function() {
            robot.y = 300 + 100* Math.cos(timer.i/10);
            robot.a = Math.PI / 4 * Math.cos(timer.i/15);
            pupil.x = 4* Math.cos(timer.i/5);
            neck1.height = 15 + 10* Math.cos(timer.i/5);
            neck1.y = -13 - 10* Math.cos(timer.i/5);
            if ( robot.view) robot.view.paint();
        });
        timer.start();
    }
  ]
});
