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
MODEL({
  name: 'TimerListener',

  properties: [
    {
      model_: 'FunctionProperty',
      name:  'callback',
      required: true
    },
    {
      model_: 'IntProperty',
      name:  'waitTime',
      required: true
    },
    {
      model_: 'IntProperty',
      name:  'lastTime',
      required: true
    }
  ],

  methods: {
    maybeRun: function(currentTime) {
      if (currentTime - this.lastTime >= this.waitTime) {
        this.callback();
        this.lastTime = currentTime;
      }
    }
  }
});

MODEL({
  name: 'TimerEvery',

  properties: [
    {
      model_: 'ArrayProperty',
      name: 'listeners_',
      factory: function() { return []; },
      hidden: true
    }
  ],

  methods: {
    add: function(waitTime, callback) {
      var listener = TimerListener.create({
          callback: callback,
          waitTime: waitTime,
          lastTime: 0
      });
      this.listeners_.push(listener);
    },
    remove: function(callback) {
      for (var i = 0; i < this.listeners_.length; ++i) {
        if (this.listeners_[i].callback === callback) {
          this.listeners_.splice(i, 1);
        }
      }
    },
    runListeners: function(currentTime) {
      this.listeners_.forEach(function(listener) {
        listener.maybeRun(currentTime);
      });
    }
  }
});

MODEL({
  name: 'Timer',

  properties: [
    {
      model_: 'IntProperty',
      name:  'interval',
      help:  'Interval of time between updating time.',
      units: 'ms',
      defaultValue: 10
    },
    {
      model_: 'IntProperty',
      name:  'i',
      defaultValue: 0
    },
    {
      model_: 'FloatProperty',
      name:  'timeWarp',
      defaultValue: 1.0
    },
    {
      model_: 'IntProperty',
      name:  'duration',
      units: 'ms',
      defaultValue: -1
    },
    {
      model_: 'FloatProperty',
      name: 'percent',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'startTime',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'time',
      help:  'The current time in milliseconds since epoch.',
      preSet: function(_, t) { return Math.ceil(t); },
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'second',
      help:  'The second of the current minute.',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'minute',
      help:  'The minute of the current hour.',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'hour',
      help:  'The hour of the current day.',
      defaultValue: 0
    },
    {
      name: 'isStarted',
      defaultValue: false,
      hidden: true
    },
    {
      name:  'every',
      help:  'Helper for adding/removing callbacks that run "every X amount of time".',
      factory: function() { return TimerEvery.create(); }
    }
  ],

  methods: {
    runListeners_: function() {
      this.every.runListeners(this.time);
    }
  },

  actions: [
    {
      name:  'start',
      help:  'Start the timer.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return ! this.isStarted; },
      action:      function() { this.isStarted = true; this.tick(); }
    },
    {
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

  listeners: [
    {
      name: 'tick',
      isAnimated: true,
      code: function(e) {
        this.timeout = undefined;
        if ( ! this.isStarted ) return;

        var prevTime = this.startTime_ || 0;
        this.startTime_ = Date.now();
        this.interval = Math.min(100, this.startTime_ - prevTime);
        this.step();
        this.runListeners_();
        this.tick();
      }
    }
  ]
});


/**
 * Used when creating PersistentContext's.
 * Ex.
 * var persistentContext = PersistentContext.create({
 *  dao: IDBDAO.create({model: Binding}),
 *   predicate: NOT_TRANSIENT,
 *   context: GLOBAL
 *  });
 * ...
 * persistentContext.bindObject('userInfo', UserInfo, {});
 *
 * TODO: Make simpler to setup.
 **/
MODEL({
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


MODEL({
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
        this.dao.put(this.X.Binding.create({
          id:    name,
          value: JSONUtil.compact.where(this.predicate).stringify(obj)
        }));
      }).bind(this), undefined, this.X));
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


MODEL({
  name: 'UserInfo',
  label: 'UserInfo',

  properties: [
    {
      model_: 'StringProperty',
      name: 'email'
    }
  ]
});
