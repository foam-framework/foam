/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

CLASS({
  package: 'foam.memento',
  name: 'MementoMgr',

  properties: [
    {
      name: 'mementoValue'
    },
    {
      name:  'stack',
      factory: function() { return []; }
    },
    {
      name:  'redo',
      factory: function() { return []; }
    }
  ],

  actions: [
    {
      name:  'back',
      label: ' <-- ',
      help:  'Go to previous view',

      isEnabled: function() { return this.stack.length; },
      code: function() {
      this.dumpState('preBack');
        this.redo.push(this.mementoValue.get());
        this.restore(this.stack.pop());
        this.propertyChange('stack', '', this.stack);
        this.propertyChange('redo', '', this.redo);
      this.dumpState('postBack');
      }
    },
    {
      name:  'forth',
      label: ' --> ',
      help:  'Undo the previous back.',

      isEnabled: function() { return this.redo.length; },
      code: function() {
      this.dumpState('preForth');
        this.remember(this.mementoValue.get());
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
      code: function(_, __, oldValue, newValue) {
        if ( this.ignore_ ) return;

        // console.log('MementoMgr.onChange', oldValue, newValue);
        this.remember(oldValue);
        this.redo = [];
        this.propertyChange('redo', '', this.redo);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.mementoValue.addListener(this.onMementoChange);
    },

    remember: function(value) {
      this.dumpState('preRemember');
      this.stack.push(value);
      this.propertyChange('stack', '', this.stack);
      this.dumpState('postRemember');
    },

    restore: function(value) {
      this.dumpState('restore');
      this.ignore_ = true;
      this.mementoValue.set(value);
      this.ignore_ = false;
    },

    dumpState: function(spot) {
      /*
      console.log('--- ', spot);
      console.log('stack: ', JSON.stringify(this.stack));
      console.log('redo: ', JSON.stringify(this.redo));
      */
    }
  }
});
