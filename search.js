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
       defaultValue: 60
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
             var options = [];
             for ( var key in groups.groups ) {
               var count = '(' + groups.groups[key] + ')';
               var subKey = key.substring(0, self.width-count.length-3);
               var cleanKey = subKey.replace('<', '&lt;').replace('>', '&gt;');
debugger;
               options.push(cleanKey + Array(self.width-subKey.length-count.length).join('&nbsp;') + count);
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
