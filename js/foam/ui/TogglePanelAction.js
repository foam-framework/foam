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
  package: 'foam.ui',
  name: 'TogglePanelAction',
  extends: 'foam.ui.DetailView',
  requires: [
    'foam.graphics.ActionButtonCView',
  ],
  methods: {
    init: function() {
      this.Y.registerModel(this.ActionButtonCView.xbind({
        alpha: 1,
        width: 48,
        height: 44,
        iconWidth: 24,
        iconHeight: 24,
      }), 'foam.ui.ActionButton');
    },
  },
  templates: [
    function toHTML() {/*
      $$togglePanel
    */}
  ]
});
