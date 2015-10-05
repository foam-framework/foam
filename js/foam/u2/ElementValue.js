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
  name: 'ElementValue',

  constants: {
    __isValue__: true
  },

  properties: [
    [ 'property', 'value' ],
    [ 'event', 'change' ],
    [ 'firstListener_', true ],
    {
      name: 'element',
      required: true
    },
    {
      name: 'value',
      postSet: function(_, value) { this.element.setAttribute(this.property, value); }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.value = this.element.getAttribute(this.property);
    },

    get: function() { return this.value; },

    set: function(value) { this.value = value; },

    addListener: function(listener) {
      if ( this.firstListener_ ) {
        if ( this.event ) {
          this.element.on(
            this.event,
            function() { debugger; }, 
            false);
        }

        this.firstListener_ = false;
      }
      this.value$.addListener(listener);
    },

    removeListener: function(listener) {
      this.value$.removeListener(listener);
    },

    toString: function() {
      return 'ElementValue(' + this.event + ', ' + this.property + ')';
    }
  }
});
