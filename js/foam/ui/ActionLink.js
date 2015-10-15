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
  name: 'ActionLink',

  extends: 'foam.ui.ActionButton',


  properties: [
    {
      // TODO: fix
      name: 'className',
      factory: function() { return 'actionLink actionLink-' + this.action.name; }
    },
    {
      name: 'tagName',
      defaultValue: 'a'
    }
  ],

  methods: {
    toHTML: function() {
      var superResult = this.SUPER(); // get the destructors done before doing our work
      this.setAttribute('href', function() { return '#' }, this.id);
      return superResult;
    },

    toInnerHTML: function() {
      if ( this.action.iconUrl ) {
        return '<img src="' + XMLUtil.escapeAttr(this.action.iconUrl) + '" />';
      }

      if ( this.action.showLabel ) {
        return this.label;
      }
    }
  }
});
