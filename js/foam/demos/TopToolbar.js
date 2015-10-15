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
  name: 'TopToolbar',
  extends: 'foam.ui.View',
  requires: [
    'foam.graphics.ActionButtonCView',
    'foam.ui.navigation.TopToolbar',
  ],
  properties: [
    {
      name: 'topToolbar',
      factory: function() {
        return this.TopToolbar.create({
          label: 'I am a toolbar',
          leftActionView: this.ActionButtonCView.create({
            action: this.TOGGLE_PANEL,
            data: this,
            alpha: 1,
            width: 48,
            height: 44,
            iconWidth: 24,
            iconHeight: 24,
          }),
        });
      },
    },
  ],
  actions: [
    {
      name: 'togglePanel',
      label: '',
      iconUrl: 'https://www.google.com/images/icons/material/system/2x/menu_white_24dp.png',
      code: function() {
        console.log('Thanks for clicking.');
      },
    },
  ],
  templates: [
    function toHTML() {/* %%topToolbar */},
  ]
});
