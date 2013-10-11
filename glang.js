// gLang - Graphical mLang's

// See: https://developers.google.com/chart/interactive/docs/index

var PieGraph = FOAM({
   model_: 'Model',

   extendsModel: 'CView',

   name: 'PieGraph',

   properties: [
      {
	 name:  'r',
	 type:  'int',
	 view:  'IntFieldView',
         postSet: function(r) {
            this.width = this.height = 2*r+2;
         },
	 defaultValue: 50
      },
      {
	 name:  'lineColor',
	 type:  'String',
	 defaultValue: 'white'
      },
      {
	 name:  'lineWidth',
	 type:  'int',
	 defaultValue: 1
      },
      {
         name: 'colorMap',
         defaultValue: undefined
      },
      {
	 name:  'data',
	 type:  'Array[float]',
         valueFactory: function() {
            return [];
         }
      },
      {
	 name: 'groups',
	 label: 'Group Data',
         defaultValue: { Apples: 5, Oranges: 6, Bananas: 4 }
      }
   ],

   methods: {
      toCount: function(o) {
         return CountExpr.isInstance(o) ? o.count : o;
      },
      toHSLColor: function(i, n) {
         return 'hsl(' + Math.floor(360*i/n) + ', 95%, 75%)';
      },
      toColor: function(key, i, n) {
        return this.colorMap && this.colorMap[key] || this.toHSLColor(i, n);
      },
      paint: function() {
         this.erase();
	 var c = this.canvas;
	 var x = this.x;
	 var y = this.y;
	 var r = this.r;

         c.save();

         c.translate(x, y);

         var sum = 0;
         var n = 0;
         for ( var key in this.groups ) {
            sum += this.toCount(this.groups[key]);
            n++;
         }

         // Drop shadown
         c.fillStyle = 'lightgray';
         c.beginPath();
         c.arc(r+2, r+2, r, 0, 2 * Math.PI);
         c.fill();

         c.lineWidth = this.lineWidth;
         c.strokeStyle = this.lineColor;

         var rads = 0;
         var i = 0;
         for ( var key in this.groups ) {
            var start = rads;
            var count = this.toCount(this.groups[key]);
            rads += count / sum * 2 * Math.PI;
            c.fillStyle = this.toColor(key, i++, n);
            c.beginPath();
            if ( count < sum ) c.moveTo(r,r);
            c.arc(r, r, r, start, rads);
            if ( count < sum ) c.lineTo(r,r);
            c.fill();
            c.stroke();
         }

         /*
         var grad = c.createLinearGradient(0, 0, r*2, r*2);
         grad.addColorStop(  0, 'rgba(0,0,0,0.1)');
         grad.addColorStop(0.5, 'rgba(0,0,0,0)');
         grad.addColorStop(  1, 'rgba(255,255,255,0.2)');
         c.fillStyle = grad;
         c.arc(r+2, r+2, r, 0, 2 * Math.PI);
         c.fill();
          */

         c.restore();
      }
   }
});


var PieExpr = FOAM({
   model_: 'Model',

   extendsModel: 'GroupByExpr',

   name: 'PieExpr',

   methods: {
     toHTML: function() {
        this.graph_ = PieGraph.create({groups: this.groups, r: 50, x: 0});
        this.graph_.copyFrom(this.opt_args);

        return this.graph_.toHTML();
     },
     initHTML: function() {
        this.graph_.initHTML();
        this.graph_.paint();
     },
     write: function(d) {
        if ( d.writeln ) { d.writeln(this.toHTML()); } else { d.log(this.toHTML()); }
        this.initHTML();
     },
     put: function(obj) {
       this.SUPER.apply(this, arguments);
       if ( this.graph_ ) {
         this.graph_.groups = this.groups;
         this.graph_.paint();
       }
     },
     remove: function() {
       this.SUPER.apply(this, arguments);
       this.graph_ && this.graph_.paint();
     },
     clone: function() {
       var p = PieExpr.create({arg1: this.arg1, arg2: this.arg2.clone()});
       p.opt_args = this.opt_args;
       return p;
     }
   }
});

var PIE = function(f, opt_args) {
   var p = PieExpr.create({arg1: f, arg2: COUNT()});

   // TODO: opt_args is a little hackish, better to either make into a real property
   // or take a PieGraph prototype as an argument/property.
   p.opt_args = opt_args;

   return p;
};