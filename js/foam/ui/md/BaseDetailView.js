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
  name: 'BaseDetailView',
  package: 'foam.ui.md',
  extends: 'foam.ui.DetailView',

  requires: [
    'foam.ui.md.TextFieldView',
    'foam.ui.md.IntFieldView',
    'foam.ui.md.FloatFieldView',
    'foam.ui.md.ToggleView',
    'foam.ui.md.ChoiceRadioView',
    'foam.ui.md.DateFieldView',
    'foam.ui.md.DateTimeFieldView',
    'foam.ui.md.ColorFieldView',
    'foam.ui.md.ImagePickerView'
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'md-detail-view'
    }
  ],
  methods: {
    init: function() {
      // Register MD PropertyViews
      this.Y_ = this.Y.sub();
      this.Y.registerModel(this.TextFieldView,  'foam.ui.TextFieldView');
      this.Y.registerModel(this.IntFieldView,   'foam.ui.IntFieldView');
      this.Y.registerModel(this.FloatFieldView, 'foam.ui.FloatFieldView');
      this.Y.registerModel(this.ToggleView, 'foam.ui.BooleanView');
      this.Y.registerModel(this.ChoiceRadioView, 'foam.ui.ChoiceListView');
      this.Y.registerModel(this.DateFieldView, 'foam.ui.DateFieldView');
      this.Y.registerModel(this.DateTimeFieldView, 'foam.ui.DateTimeFieldView');
      this.Y.registerModel(this.ChoiceRadioView, 'foam.ui.ChoiceView');
      this.SUPER();
    },
    titleHTML:    function() { return ''; },
    startForm:    function() { return ''; },
    endForm:      function() { return ''; },
    startColumns: function() { return ''; },
    nextColumn:   function() { return ''; },
    endColumns:   function() { return ''; },
    rowToHTML: function(prop, view) {
      /* HTML formatter for each $$DOC{ref:'Property'} row. */
      var str = "";

      str += view.toHTML();
      str += '<br>';

      return str;
    }
  },
  templates: [
    function CSS() {/* .md-detail-view { flex-grow: 1; } */}
  ]
});
