var GroupBySearchView = FOAM.create({

   model_: 'Model',

   extendsModel: 'AbstractView2',

   name:  'GroupBySearchView',
   label: 'GroupBy Search View',

   properties: [
     {
       name: 'view',
       label: 'View',
       type: 'view',
       valueFactory: function() { return ChoiceView.create({size:this.size, cssClass: 'foamSearchChoiceView'}); }
     },
     {
       name:  'width',
       label: 'Width',
       type:  'int',
       defaultValue: 47
     },
     {
       name:  'size',
       label: 'Size',
       type:  'int',
       defaultValue: 17
     },
     {
       name:  'dao',
       label: 'DAO',
       type: 'DAO',
       required: true,
       postSet: function() {
         if ( this.view.id ) this.updateDAO();
       }
     },
     {
       name: 'property',
       label: 'Property',
       type: 'Property'
     },
     {
       name: 'filter',
       label: 'Filter',
       type: 'Object',
       defaultValue: TRUE
     },
     {
       name: 'predicate',
       label: 'Predicate',
       type: 'Object',
       defaultValue: TRUE
     },
     {
       name: 'label',
       type: 'String',
       defaultValueFn: function() { return this.property.label; }
     }
   ],

   methods: {
     toHTML: function() {
       return '<div class="foamSearchView">' +
         '<div class="foamSearchViewLabel">' +
           this.label +
         '</div>' +
         this.view.toHTML() +
         '</div>';
     },
     initHTML: function() {
       this.view.initHTML();

//       Events.dynamic(function() { this.view.value; }, console.log.bind(console));
       Events.dynamic(function() { this.dao; }, this.updateDAO);
       this.propertyValue('filter').addListener(this.updateDAO);
/*
       this.propertyValue('filter').addListener((function(a,b,oldValue,newValue) {
         this.updateDAO();
       }).bind(this));
*/
       this.view.value.addListener(this.updateChoice);
//       this.updateDAO();
//       this.view.addListener(console.log.bind(console));
//       this.view.value.addListener(console.log.bind(console));
     }
   },

   listeners:
   [
      {
	 model_: 'MethodModel',

	 name: 'updateDAO',

	 code: function() {
           var self = this;

           this.dao.where(this.filter).select(GROUP_BY(this.property, COUNT()))(function(groups) {
             var options = [];
             for ( var key in groups.groups ) {
               var count = ('(' + groups.groups[key] + ')').intern();
               var subKey = key.substring(0, self.width-count.length-3);
               var cleanKey = subKey.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
               options.push([key, cleanKey + (Array(self.width-subKey.length-count.length).join('&nbsp;')).intern() + count]);
             }
             options.sort();
             options.splice(0,0,['','-- CLEAR SELECTION --']);
             self.view.choices = options;
             // console.log(groups.groups, options);
           });
	 }
      },
      {
	 model_: 'MethodModel',

	 name: 'updateChoice',

	 code: function(newValue, oldValue) {
           var choice = newValue.get();
           this.predicate = ( ! choice ) ? TRUE : EQ(this.property, choice);
	 }
      }

   ]

});


var TextSearchView = FOAM.create({

   model_: 'Model',

   extendsModel: 'AbstractView2',

   name:  'TextSearchView',
   label: 'Text Search View',

   properties: [
     {
       name:  'width',
       label: 'Width',
       type:  'int',
       defaultValue: 47
     },
     {
       name: 'property',
       label: 'Property',
       type: 'Property'
     },
     {
       name: 'predicate',
       label: 'Predicate',
       type: 'Object',
       defaultValue: TRUE
     },
     {
       name: 'view',
       label: 'View',
       type: 'view',
       valueFactory: function() { return TextFieldView.create({displayWidth:this.width, cssClass: 'foamSearchTextField'}); }
     },
     {
       name: 'label',
       type: 'String',
       defaultValueFn: function() { return this.property.label; }
     }
   ],

   methods: {
     toHTML: function() {
       return '<div class="foamSearchView">' +
         '<div class="foamSearchViewLabel">' +
           this.label +
         '</div>' +
         this.view.toHTML() + '</div>' +
         '<div id=' + this.registerCallback('click', this.clear) + ' style="text-align:right;width:100%;float:right;margin-bottom:20px;" class="searchTitle"><font size=-1><u>Clear</u></font></div>';
     },
     initHTML: function() {
	AbstractView2.getPrototype().initHTML.call(this);
	this.view.initHTML();

	this.view.value.addListener(this.updateValue);
     }
   },

   listeners:
   [
      {
	 model_: 'MethodModel',

	 name: 'updateValue',

	 code: function() {
	    var value = this.view.getValue().get();
	    if ( ! value ) {
	       this.predicate = TRUE;
	       return;
	    }
	   this.predicate = CONTAINS_IC(this.property, value);
	 }
      },
      {
	 model_: 'MethodModel',

	 name: 'clear',

	 code: function() {
console.log('**************************** clear');
	   this.view.getValue().set('');
	   this.predicate = TRUE;
	 }
      }

   ]
});
