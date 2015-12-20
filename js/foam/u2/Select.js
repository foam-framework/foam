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
  package: 'foam.u2',
  name: 'Select',
  extends: 'foam.u2.View',

  traits: [
    'foam.u2.ChoiceViewTrait',
  ],

  imports: [ 'dynamic' ],

  properties: [
    [ 'nodeName', 'select' ],
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      Events.relate(
        this.data$,
        this.attrValue(),
        function(data) { return self.valueToIndex(data); },
        function(attr) { return self.choices[attr][0]; });

      this.setChildren(this.dynamic(function(options, placeholder) {
        var cs = [];
        if ( placeholder )
          cs.push(self.E('option').attrs({disabled: 'disabled'}).add(self.placeholder));
        for ( var i = 0 ; i < options.length ; i++ ) {
          var o = options[i];
          cs.push(self.E('option').attrs({value: i}).add(o[1]));
        }
        return cs;
      }, this.choices$, this.placeholder$));
    }
  ]
});
