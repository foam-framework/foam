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

CLASS({
  package: 'foam.ui',
  name: 'RadioBoxView',

  extends: 'foam.ui.ChoiceView',

  methods: {
    toHTML: function() {
      return '<span id="' + this.id + '"/></span>';
    },

    updateHTML: function() {
      if ( ! this.$ ) return;
      var out = '';
      var self = this;
      this.choices.forEach(function(choice) {
        var value  = choice[0];
        var text  = choice[1];
        var id     = self.nextID();

        out += text + ':<input type="radio" name="';
        out += self.id;
        out += '" value="';
        out += value;
        out += '" ';
        out += 'id="' + id + '"';
        if ( self.data === value ) out += ' checked';
        out += '> ';

        self.on('click', function() { self.data = value; }, id)
        self.data$.addListener(function() { $(id).checked = ( self.data == value ); });
      });

      this.$.innerHTML = out;
      View.getPrototype().initHTML.call(this);
    },

    initHTML: function() {
      this.SUPER();

      Events.dynamicFn(function() { this.choices; }.bind(this), this.updateHTML.bind(this));
    }
  }
});
