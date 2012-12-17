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
       this.propertyValue('filter').addListener((function(a,b,oldValue,newValue) {
         this.updateDAO();
       }).bind(this));
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
           var groups = futureSink(GROUP_BY(this.property, COUNT()));
           this.dao.where(this.filter).select(groups);
           groups.future(function(groups) {
             var options = [];
             for ( var key in groups.groups ) {
               var count = '(' + groups.groups[key] + ')';
               var subKey = key.substring(0, self.width-count.length-3);
               var cleanKey = subKey.replace(/</g, '&lt;').replace(/>/g, '&gt;');
               options.push([key, cleanKey + Array(self.width-subKey.length-count.length).join('&nbsp;') + count]);
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
console.log('***** Search Choice:', choice);
	    this.predicate = ( ! choice ) ? TRUE : EQ(this.property, choice);
	 }
      }

   ]

});
