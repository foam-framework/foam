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
  extendsModel: 'foam.u2.Element',

  properties: [
    {
      name: 'options',
      adapt: function(_, options) {
        return options.map(function(o) { return Array.isArray(o) ? o : [o, o]; });
      },
      factory: function() { return []; }
    },
    [ 'nodeName', 'select' ],
    'data',
    'placeholder'
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;
      this.data$ = this.attrValue();
      this.add(function(options, placeholder) {
        if ( placeholder )
          self.add(E('option').attrs({disabled: 'disabled'}).add(self.placeholder));
        for ( var i = 0 ; i < options.length ; i++ ) {
          var o = options[i];
          self.add(E('option').attrs({value: o[0]}).add(o[1]));
        }
      }.on$(this.X, this.options$, this.placeholder$));
    }
  ]
});
