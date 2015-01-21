CLASS({
  package: 'foam.chromeapp.ui',

  name: 'ZoomView',
  extendsModel: 'View',

  imports: [ 'window', 'document' ],

  documentation: 'Add zoom in/out support to ChromeApps.',

  properties: [
    {
      name: 'zoom',
      defaultValue: 1,
      postSet: function(_, z) { this.document.body.style.zoom = z; }
    }
  ],
  methods: {
    resizeBy: function(dx, dy) {
      this.window.resizeBy(dx, dy);

      // generate a resize event in case the window is already maximized
      // so that components that relayout on resize will still relayout
      var event = this.document.createEvent('Event');
      event.initEvent('resize', true, true);
      this.document.dispatchEvent(event);
    }
  },
  actions: [
    {
      name: 'zoomIn',
      keyboardShortcuts: [ 'ctrl-shift-187', 'ctrl-187' ],
      action: function() {
        this.resizeBy(this.document.body.clientWidth/10, this.document.body.clientHeight/10);
        this.zoom *= 1.1;
      }
    },
    {
      name: 'zoomOut',
      keyboardShortcuts: [ 'ctrl-shift-189', 'ctrl-189' ],
      action: function() {
        this.resizeBy(-this.document.body.clientWidth/10, -this.document.body.clientHeight/10);
        this.zoom /= 1.1;
      }
    },
    {
      name: 'zoomReset',
      action: function() { this.zoom = 1.0; }
    }
  ]
});
