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
  name: 'ActionButton',

  extends: 'foam.u2.Element',

  properties: [
    'action',
    'data',
    [ 'nodeName', 'button' ],
    {
      name: 'showLabel',
      defaultValueFn: function() { return this.action.showLabel; }
    },
    {
      name: 'label',
      defaultValueFn: function() {
        return this.data ?
            this.action.labelFn.call(this.data, this.action) :
            this.action.label ;
      }
    },
    {
      name: 'iconUrl',
      defaultValueFn: function() { return this.action.iconUrl; }
    },
    {
      name: 'tooltip',
      defaultValueFn: function() { return this.action.help; }
    }
  ],

  templates: [
    function CSS() {/*
      .foam-u2-ActionButton {
        margin: 5px;
        padding: 5px;
      }
    */}
  ],

  methods: [
    function init() {
      this.SUPER();

      var self = this;

      this.
        cls('foam-u2-ActionButton').
        on('click', function() { self.action.maybeCall(self.X, self.data); }).
        attrs({disabled: function() {
          // self.closeTooltip();
          return self.action.isEnabled.call(self.data, self.action) ? undefined : 'disabled';
        }}).
        cls({available: function() {
          // self.closeTooltip();
          return self.action.isAvailable.call(self.data, self.action);
        }}).
        add(this.iconUrl && this.Image.create({src: this.iconUrl})).
        add(this.showLabel && function() { return self.label; }.on$(this.data$, this.label$));
    }
  ]
});
