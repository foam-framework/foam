/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
var MementoMgr = FOAM({
  model_: 'Model',

  name:  'MementoMgr',

  properties: [
    {
      name: 'memento'
    },
    {
      name: 'value'
    },
    {
      name:  'stack',
      valueFactory: function() { return []; }
    },
    {
      name:  'redo',
      valueFactory: function() { return []; }
    }
  ],

  actions: [
    {
      model_: 'Action',
      name:  'back',
      label: ' <-- ',
//      iconUrl: FOAM_BOOT_DIR + 'images/Navigation_Left_Arrow.svg',
      help:  'Go to previous view',

      isEnabled:   function() { return this.stack.length; },
      action:      function() {
      this.dumpState('preBack');
        this.redo.push(this.memento.value);
        this.restore(this.stack.pop());
        this.propertyChange('stack', '', this.stack);
        this.propertyChange('redo', '', this.redo);
      this.dumpState('postBack');
      }
    },
    {
      model_: 'Action',
      name:  'forth',
      label: ' --> ',
//      iconUrl: FOAM_BOOT_DIR + 'images/Navigation_Right_Arrow.svg',
      help:  'Undo the previous back.',

      isEnabled:   function() { return this.redo.length; },
      action:      function() {
      this.dumpState('preForth');
        this.remember(this.memento.value);
        this.restore(this.redo.pop());
        this.propertyChange('stack', '', this.stack);
        this.propertyChange('redo', '', this.redo);
      this.dumpState('postForth');
      }
    }
  ],

  listeners: [
    {
      name: 'onMementoChange',
      code: function(_, _, newValue, oldValue) {
        console.log('MementoMgr.onChange', newValue, oldValue);
      // this.dumpState('preChange');
        if ( ! oldValue || this.ignore_ ) return;
        this.remember(oldValue);
        this.redo = [];
        this.propertyChange('redo', '', this.redo);
      //this.dumpState('postChange');
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.memento.addListener(this.onMementoChange);
    },

    remember: function(value) {
      this.dumpState('preRemember');
      this.stack.push(value);
      this.propertyChange('stack', '', this.stack);
      this.dumpState('postRemember');
    },

    restore: function(value) {
      this.dumpState('restore');
      this.value = value;
    },

    dumpState: function(spot) {
      console.log('--- ', spot);
      console.log('stack: ', JSON.stringify(this.stack));
      console.log('redo: ', JSON.stringify(this.redo));
    }
  }
});


var CompoundMemento = FOAM({
  model_: 'Model',

  name:  'CompoundMemento',

  properties: [
    {
      name: 'root'
    },
    {
      name: 'map'
    },
    {
      name: 'value',
      valueFactory: function() { return this.propertyValue('map'); }
    },
    {
      name: 'rules',
      help: 'Rules for creating the memento map.'
    }
  ],

  listeners: [
    {
      name: 'onValueChange',
      code: function() {
      }
    }
  ],

  methods: {
    get: function() { this.update(); return this.map; },
    set: function(map) {
      var rules = this.rules;

      for ( var i = 0 ; i < rules.length ; i++ ) {
        var rule = rules[i];
        var path = rule[1];
        var value = this.path(path);
        if ( value ) {
          rule[3].call(this.root, value);
        }
      }
    },

    path: function(path) {
      var value = this.root;
      for ( var j = 0 ; j < path.length && value ; j++ ) {
        value = value[path[j]];
      }
      return value;
    },

    toParams: function() {
      var rules = this.rules;
      var s = '';
      var d = '';
      for ( var key in this.map ) {
        s += d;
        s += key + '=' + encodeURIComponent(this.map[key]);
        d = '&';
      }
      return s;
    },

    fromParams: function(url) {
      var params = match[3].split('&');
      var m = {};
      for ( var i = 0 ; i < params.length ; i++ ) {
        var param = params[i];
        var keyValue = param.split('=');
        m[decodeURIComponent(keyValue[0])] =
          decodeURIComponent(keyValue[1]).replace(/\+/g, ' ');
      }
      this.map = m;
    },

    update: function() {
      var rules = this.rules;
      var m = {};

      for ( var i = 0 ; i < rules.length ; i++ ) {
        var rule = rules[i];
        var path = rule[1];
        var value = this.path(path);
        if ( value ) {
          m[rule[0]] = rule[2].call(this.root, value);
        }
      }

      this.map = m;
    }
  }
});

