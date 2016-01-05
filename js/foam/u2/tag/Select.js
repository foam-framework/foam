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
  package: 'foam.u2.tag',
  name: 'Select',
  extends: 'foam.u2.View',

  imports: [ 'dynamic' ],

  properties: [
    [ 'nodeName', 'select' ],
    {
      name: 'choices',
      factory: function() {
        return [];
      }
    },
    ['placeholder', ''],
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      Events.link(this.data$, this.attrValue());

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
