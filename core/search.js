/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var GroupBySearchView = FOAM({

   model_: 'Model',

   extendsModel: 'AbstractView',

   name:  'GroupBySearchView',
   label: 'GroupBy Search View',

   properties: [
     {
       name: 'view',
       type: 'view',
       valueFactory: function() { return ChoiceView.create({size:this.size, cssClass: 'foamSearchChoiceView'}); }
     },
     {
       name:  'width',
       type:  'int',
       defaultValue: 47
     },
     {
       name:  'size',
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
       type: 'Property'
     },
     {
       name: 'filter',
       type: 'Object',
       defaultValue: TRUE
     },
     {
       name: 'predicate',
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
         model_: 'Method',

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
         model_: 'Method',

         name: 'updateChoice',

         code: function(newValue, oldValue) {
           var choice = newValue.get();
           this.predicate = ( ! choice ) ? TRUE : EQ(this.property, choice);
         }
      }

   ]

});


var TextSearchView = FOAM({

   model_: 'Model',

   extendsModel: 'AbstractView',

   name:  'TextSearchView',

   properties: [
     {
       name:  'width',
       type:  'int',
       defaultValue: 47
     },
     {
       name: 'property',
       type: 'Property'
     },
     {
       name: 'predicate',
       type: 'Object',
       defaultValue: TRUE
     },
     {
       name: 'view',
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
         '<div id=' + this.on('click', this.clear) + ' style="text-align:right;width:100%;float:right;margin-bottom:20px;" class="searchTitle"><font size=-1><u>Clear</u></font></div>';
     },
     initHTML: function() {
       this.SUPER();
       this.view.initHTML();

       this.view.value.addListener(this.updateValue);
     }
   },

   listeners:
   [
      {
         model_: 'Method',

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
         model_: 'Method',

         name: 'clear',

         code: function() {
console.log('**************************** clear');
           this.view.getValue().set('');
           this.predicate = TRUE;
         }
      }

   ]
});
