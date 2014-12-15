CLASS({
  package: 'foam.ui.md',
  name: 'Flare',

  requires: [ 'foam.graphics.Circle' ],

  properties: [
    'color',
    'element',
    {
      name: 'startX',
      defaultValue: 1
    },
    {
      name: 'startY',
      defaultValue: 1
    }
  ],

  listeners: [
    {
      name: 'fire',
      code: function() {
        var w = this.element.clientWidth;
        var h = this.element.clientHeight;
        var c = this.Circle.create({
          r: 0,
          width: w,
          height: h,
          x: this.startX * w,
          y: this.startY * h,
          color: this.color
        });
        var view = c.toView_();
        var div = document.createElement('div');
        var dStyle = div.style;
        dStyle.position = 'absolute';
        dStyle.left = 0;
        dStyle.zIndex = 4;
        
        var id = View.getPrototype().nextID();
        div.id = id;
        div.innerHTML = view.toHTML();
        this.element.appendChild(div);
        view.initHTML();
        
        Movement.compile([
          // MYSTERY(kgr): I don't know why the 1.25 is needed.
          [400, function() { c.r = 1.25 * Math.sqrt(w*w, h*h); }],
          [200, function() { c.alpha = 0; }],
          function() { div.remove(); }
        ])();
        
        c.r$.addListener(EventService.framed(view.paint.bind(view)));
        c.alpha$.addListener(EventService.framed(view.paint.bind(view)));
      }
    }
  ]
});
