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

/**
 * Only completely modelled models here.
 * All models in this file can be stored and loaded in a DAO.
 **/
FOAModel({
   model_: 'Model',

   name: 'Timer',

   properties: [
      {
         name:  'interval',
         type:  'int',
         view:  'IntFieldView',
         help:  'Interval of time between updating time.',
         units: 'ms',
         defaultValue: 10
      },
      {
         name:  'i',
         type:  'int',
         view:  'IntFieldView',
         defaultValue: 0
      },
      {
         name:  'timeWarp',
         type:  'float',
         view:  'FloatFieldView',
         defaultValue: 1.0
      },
      {
         name:  'duration',
         type:  'int',
         view:  'IntFieldView',
         units: 'ms',
         defaultValue: -1
      },
      {
         name: 'percent',
         type: 'float',
         view:  'FloatFieldView',
         defaultValue: 0
      },
      {
         name:  'startTime',
         type:  'int',
         view:  'IntFieldView',
         defaultValue: 0
      },
      {
         name:  'time',
         type:  'int',
         help:  'The current time in milliseconds since epoch.',
         view:  'IntFieldView',
         defaultValue: 0
      },
      {
         name:  'second',
         type:  'int',
         help:  'The second of the current minute.',
         view:  'IntFieldView',
         defaultValue: 0
      },
      {
         name:  'minute',
         type:  'int',
         help:  'The minute of the current hour.',
         view:  'IntFieldView',
         defaultValue: 0
      },
      {
         name:  'hour',
         type:  'int',
         help:  'The hour of the current day.',
         view:  'IntFieldView',
         defaultValue: 0
      },
      {
        name: 'isStarted',
        defaultValue: false,
        hidden: true
      }
   ],

   actions: [
     {
       model_: 'Action',
       name:  'start',
       help:  'Start the timer.',

       isAvailable: function() { return true; },
       isEnabled:   function() { return ! this.isStarted; },
       action:      function() { this.isStarted = true; this.tick(); }
     },
     {
       model_: 'Action',
       name:  'step',
       help:  'Step the timer.',

       isAvailable: function() { return true; },
       action: function()      {
         this.i++;
         this.time  += this.interval * this.timeWarp;
         this.second = this.time /    1000 % 60 << 0;
         this.minute = this.time /   60000 % 60 << 0;
         this.hour   = this.time / 3600000 % 24 << 0;
       }
     },
     {
       model_: 'Action',
       name:  'stop',
       help:  'Stop the timer.',

       isAvailable: function() { return true; },
       isEnabled: function() { return this.isStarted; },
       action: function() {
         this.isStarted = false;
         if ( this.timeout ) {
           clearTimeout(this.timeout);
           this.timeout = undefined;
         }
       }
     }
   ],

   methods: {
     tick: function() {
       this.timeout = undefined;
       if ( ! this.isStarted ) return;

       this.step();
       this.timeout = setTimeout(this.tick.bind(this), this.interval);
     }
   }
});


FOAModel({

   model_: 'Model',

   name: 'Binding',

   properties: [
      // TODO: add support for named sub-contexts
      {
         name:  'id',
         hidden: true
      },
      {
         name:  'value',
         hidden: true
      }
   ]
});


FOAModel({

   model_: 'Model',

   name: 'PersistentContext',

   properties: [
      {
         name:  'dao',
         label: 'DAO',
         type: 'DAO',
         hidden: true
      },
      {
         name:  'context',
         hidden: true
      },
      {
          name: 'predicate',
          type: 'Expr',
          defaultValueFn: function() { return TRUE; },
          hidden: true
      }
   ],

   methods: {
      /**
       * Manage persistene for an object.
       * Resave it in the DAO whenever it first propertyChange events.
       **/
      manage: function(name, obj) {
         obj.addListener(EventService.merged((function() {
            console.log('PersistentContext', 'updating', name);
            this.dao.put(Binding.create({
               id:    name,
               value: JSONUtil.compact.where(this.predicate).stringify(obj)
             }));
         }).bind(this)));
      },
      bindObjects: function(a) {
         // TODO: implement
      },
      bindObject: function(name, model, createArgs) {
         console.log('PersistentContext', 'binding', name);
        var future = afuture();
        createArgs = createArgs || {};

         if ( this.context[name] ) {
            future.set(this.context[name]);
         } else {
            this.dao.find(name, {
               put: function (binding) {
                  console.log('PersistentContext', 'existingInit', name);
//                  var obj = JSONUtil.parse(binding.value);
//                  var obj = JSON.parse(binding.value);
                  var json = JSON.parse(binding.value);
                  json.__proto__ = createArgs;
                  var obj = JSONUtil.mapToObj(json);
                  this.context[name] = obj;
                  this.manage(name, obj);
                  future.set(obj);
               }.bind(this),
               error: function() {
                  console.log('PersistentContext', 'newInit', name);
                  var obj = model.create(createArgs);
                  this.context[name] = obj;
                  this.manage(name, obj);
                  future.set(obj);
               }.bind(this)
            });
         }

         return future.get;
      }
  }
});

FOAModel({
  model_: 'Model',
  name: 'Person',
  properties: [
    { model_: 'IntegerProperty', name: 'id' },
    { name: 'name' },
    { name: 'sex', defaultValue: 'M' },
    { model_: 'IntegerProperty', name: 'age' }
  ]
});

FOAModel({
  model_: 'Model',

  name: 'UserInfo',
  label: 'UserInfo',

  properties: [
    {
      model_: 'StringProperty',
      name: 'email'
    }
  ]
});
