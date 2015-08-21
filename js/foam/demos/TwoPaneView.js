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
  package: 'foam.demos',
  name: 'TwoPaneView',

  extendsModel: 'foam.ui.View',

  requires: [
    'foam.ui.md.Card',
    'foam.ui.md.CheckboxView',
    'foam.ui.md.ToggleView',
    'foam.ui.ViewChoice',
    'foam.ui.md.TwoPaneView'
  ],

  properties: [
    {
      name: 'view',
      view: 'foam.ui.TwoPaneView',
      factory: function() {
        var view = this.TwoPaneView.create({
          views: [
            this.ViewChoice.create({
              label: 'Checkbox',
              view: function() {
                return foam.ui.md.Card.create({
                  delegate: function() { return foam.ui.md.CheckboxView.create({
                    label: 'Checkbox',
                  }) },
                });
              },
            }),
            this.ViewChoice.create({
              label: 'Toggle',
              view: function() {
                return foam.ui.md.Card.create({
                  delegate: function() { return foam.ui.md.ToggleView.create({
                    label: 'Toggle',
                  }) },
                });
              },
            }),
          ]
        });
        return view;
      },
    },
  ],

  templates: [
    function toHTML() {/*
      %%view
    */}
  ]
});
