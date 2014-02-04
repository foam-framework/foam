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
      name: 'memorable'
    },
    {
      name: 'memento',
      getter: function() { return this.memorable.memento; },
      setter: function(m) { console.log('********* MEMENTO: ', m); this.ignore_ = true; this.memorable.memento = m; this.ignore_ = false; }
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
        this.redo.push(this.memento);
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
        this.remember(this.memento);
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
      code: function(_, _, oldValue) {
      //this.dumpState('preChange');
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

      this.memorable.addPropertyListener('memento', this.onMementoChange);
    },

    remember: function(memento) {
      this.dumpState('preRemember');
      this.stack.push(memento);
      this.propertyChange('stack', '', this.stack);
      this.dumpState('postRemember');
    },

    restore: function(memento) {
      this.dumpState('restore');
      this.memento = memento;
    },

    dumpState: function(spot) {
      console.log('--- ', spot);
      console.log('stack: ', JSON.stringify(this.stack));
      console.log('redo: ', JSON.stringify(this.redo));
    }
  }
});
