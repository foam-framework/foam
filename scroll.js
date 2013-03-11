var ScrollCView = FOAM.create({

   model_: 'Model',

   extendsModel: 'CView',

   name:  'ScrollCView',

   properties: [
      {
	 name:  'parent',
	 label: 'Parent',
         type:  'CView',
	 hidden: true,
         postSet: function(newValue, oldValue) {
//	   oldValue && oldValue.removeListener(this.updateValue);
//	   newValue.addListener(this.updateValue);
           var e = newValue.element();
           if ( ! e ) return;
           e.addEventListener('mousedown', this.mouseDown, false);
           e.addEventListener('touchstart', this.touchStart, false);
//           e.addEventListener('mouseup',   this.mouseUp,   false);
         }
      },
      {
	name:  'vertical',
        type:  'boolean',
        defaultValue: true
      },
      {
	name:  'value',
        type:  'int',
        help:  'The first element being shown, starting at zero.',
        defaultValue: 0
      },
      {
	name:  'extent',
        help:  'Number of elements shown.',
        type:  'int',
        defaultValue: 10
      },
      {
	 name:  'size',
         type:  'int',
         defaultValue: 0,
         help:  'Total number of elements being scrolled through.',
         postSet: function() { this.paint(); }
      },
      {
	 name:  'minHandleSize',
         type:  'int',
         defaultValue: 10,
         help:  'Minimum size to make the drag handle.'
      },
      {
        name: 'startY',
        type: 'int',
        defaultValue: 0
      },
      {
        name: 'startValue',
        help: 'Starting value or current drag operation.',
        type: 'int',
        defaultValue: 0
      },
      {
	 name:  'handleColor',
	 label: 'Color',
	 type:  'String',
	 defaultValue: 'rgb(107,136,173)'
      },
      {
	 name:  'borderColor',
	 label: 'Color',
	 type:  'String',
	 defaultValue: '#555'
      }
   ],

   listeners: {
     mouseDown: function(e) {
//       this.parent.element().addEventListener('mousemove', this.mouseMove, false);
       this.startY = e.y - e.offsetY;
       window.addEventListener('mouseup', this.mouseUp, true);
       window.addEventListener('mousemove', this.mouseMove, true);
       window.addEventListener('touchstart', this.touchstart, true);
       this.mouseMove(e);
     },
     mouseUp: function(e) {
       e.preventDefault();
       window.removeEventListener('mousemove', this.mouseMove, true);
       window.removeEventListener('mouseup', this.mouseUp, true);
//       this.parent.element().removeEventListener('mousemove', this.mouseMove, false);
     },
     mouseMove: function(e) {
       var y = e.y - this.startY;
       e.preventDefault();

       this.value = Math.max(0, Math.min(this.size - this.extent, Math.round(( y - this.y ) / (this.height-4) * this.size)));
     },
     touchStart: function(e) {
       this.startY = e.targetTouches[0].pageY;
       this.startValue = this.value;
       window.addEventListener('touchmove', this.touchMove, false);
//       this.parent.element().addEventListener('touchmove', this.touchMove, false);
       this.touchMove(e);
     },
     touchEnd: function(e) {
       window.removeEventListener('touchmove', this.touchMove, false);
       window.removeEventListener('touchend', this.touchEnd, false);
//       this.parent.element().removeEventListener('touchmove', this.touchMove, false);
     },
     touchMove: function(e) {
       var y = e.targetTouches[0].pageY;
       e.preventDefault();
       this.value = Math.max(0, Math.min(this.size - this.extent, Math.round(this.startValue + (y - this.startY) / (this.height-4) * this.size )));
     },
     updateValue: function() {
       this.paint();
     }
   },

   methods: {

    init: function(args) {
       AbstractView2.init.call(this, args);
       this.addListener(EventService.animate(this.paint.bind(this)));
    },

    paint: function() {
      if ( ! this.size ) return;

      var c = this.canvas;
      if ( ! c ) return;

      this.erase();

      if ( this.extent >= this.size ) return;

      c.strokeStyle = this.borderColor;
      c.strokeRect(this.x, this.y, this.width-2, this.height);

      c.fillStyle = this.handleColor;
           
      var h = this.height-8;
      var handleSize = this.extent / this.size * h;

      if ( handleSize < this.minHandleSize ) {
        h -= this.minHandleSize - handleSize;
	handleSize = this.minHandleSize;
      }

      c.fillRect(
        this.x + 2,
        this.y + 2 + this.value / this.size * h,
        this.width - 6,
        this.y + 2 + handleSize);
    },

    destroy: function() {
//      this.value.removeListener(this.listener_);
    }
   }
});


/** Add a scrollbar around an inner-view. **/
var ScrollBorder = FOAM.create({

   model_: 'Model',

   extendsModel: 'AbstractView2',

   name:  'ScrollBorder',
   label: 'Scroll Border',

   properties: [
       {
	   name: 'view',
	   label: 'View',
	   type: 'view',
           postSet: function(view) {
             this.scrollbar.extent = this.view.rows;
           }
       },
       {
	   name: 'scrollbar',
	   label: 'Scrollbar',
	   type: 'ScrollCView',
           valueFactory: function() {
             var sb = ScrollCView.create({height:1800, width: 20, x: 2, y: 2, extent: 10});

	     if ( this.dao ) this.dao.select(COUNT())(function(c) { sb.size = c.count; });

	     return sb;
           }
       },
       {
         name:  'dao',
         label: 'DAO',
         type: 'DAO',
	 hidden: true,
         required: true,
         postSet: function(newValue, oldValue) { 
          this.view.dao = newValue;
           var self = this;

           this.dao.select(COUNT())(function(c) {
               self.scrollbar.size = c.count;
               self.scrollbar.value = 0;
           });
           /*
           if ( oldValue && this.listener ) oldValue.unlisten(this.listener);
           this.listener && val.listen(this.listener);
           this.repaint_ && this.repaint_();
            */
         }
       }
   ],

   methods: {
     layout: function() {
       this.view.layout();
       this.scrollbar.height = toNum(window.getComputedStyle(this.view.element().children[0]).height)-36;
     },
     toHTML: function() {
       return '<table width=100% border=0><tr><td valign=top>' +
         this.view.toHTML() +
         '</td><td valign=top><div class="scrollSpacer"></div>' +
         this.scrollbar.toHTML() +
         '</td></tr></table>';
     },
     initHTML: function() {
       this.view.initHTML();
       this.scrollbar.initHTML();
       this.scrollbar.paint();

       var view = this.view;
       var scrollbar = this.scrollbar;
       var self = this;

       Events.dynamic(function() {scrollbar.value;}, function() {
         if ( self.dao ) self.view.dao = self.dao.skip(scrollbar.value);
       });

       Events.dynamic(function() {view.rows;}, function() {
         scrollbar.extent = view.rows;
       });
     }
   }
});


