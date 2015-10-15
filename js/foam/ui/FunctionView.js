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

CLASS({
  package: 'foam.ui',
  name:  'FunctionView',

  extends: 'foam.ui.TextFieldView',
  requires: [ 'foam.ui.TextFieldView' ],

  properties: [
    {
      name: 'updateMode',
      factory: function() { return this.EACH_KEYSTROKE; }
    },
    {
      name: 'displayWidth',
      defaultValue: 80
    },
    {
      name: 'displayHeight',
      defaultValue: 8
    },
    {
      name: 'errorView',
      factory: function() { return this.TextFieldView.create({mode:'read-only'}); }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.errorView.initHTML();
      this.errorView.$.style.color   = 'red';
      this.errorView.$.style.display = 'none';
    },

    toHTML: function() {
      return this.errorView.toHTML() + ' ' + this.SUPER();
    },

    setError: function(err) {
      this.errorView.data = err || '';
      this.errorView.$.style.display = err ? 'block' : 'none';
    },

    textToValue: function(text) {
      if ( ! text ) return null;

      try {
        var ret = eval('(' + text + ')');

        this.setError(undefined);

        return ret;
      } catch (x) {
        console.log('JS Error: ', x, text);
        this.setError(x);

        var f = function() {};
        f.toString = function() { return text; };
        return f;
      }
    },

    valueToText: function(value) {
      return value ? value.toString() : '';
    }
  }
});
