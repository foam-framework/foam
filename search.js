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
       name:  'size',
       label: 'Size',
       type:  'int',
       defaultValue: 17
     },
     {
       name:  'dao',
       label: 'DAO',
       type: 'DAO',
       required: true
     },
     {
       name: 'property',
       label: 'Property',
       type: 'Property'
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

       Events.dynamic(function() { this.dao; }, this.update);
     }
   },

   listeners:
   [
      {
	 model_: 'MethodModel',

	 name: 'update',
	 code: function() {
           var self = this;
           var groups = futureSink(GROUP_BY(this.property, COUNT()));
           this.dao.select(groups);
           groups.future(function(groups) {
             var maxSize = 0;
             for ( var key in groups.groups ) {
               maxSize = Math.max(maxSize, key.length);
             }
             var options = [];
             for ( var key in groups.groups ) {
               var cleanKey = key.replace('<', '&lt;').replace('>', '&gt;');
               options.push(cleanKey + Array(4 + maxSize-key.length).join('&nbsp;') + '(' + groups.groups[key] + ')');
             }
             options.sort();
             options.splice(0,0,'-- CLEAR SELECTION --');
             self.view.choices = options;
             // console.log(groups.groups, options);
           });
	 }
      }
   ]

});
