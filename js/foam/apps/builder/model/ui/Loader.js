/*
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.apps.builder.model.ui',
  name: 'Loader',

  requires: [
    'foam.apps.builder.model.ui.StringPropertyView',
    'foam.apps.builder.model.ui.BooleanPropertyView',
    'foam.apps.builder.model.ui.FloatPropertyView',
    'foam.apps.builder.model.ui.IntPropertyView',
    'foam.apps.builder.model.ui.PropertyView',

    'foam.apps.builder.model.ui.StringPropertyEditView',
    'foam.apps.builder.model.ui.BooleanPropertyEditView',
    'foam.apps.builder.model.ui.FloatPropertyEditView',
    'foam.apps.builder.model.ui.IntPropertyEditView',
    'foam.apps.builder.model.ui.PropertyEditView',

    'foam.apps.builder.model.ui.EditView',
    'foam.apps.builder.model.ui.InlineEditView',
    'foam.apps.builder.model.ui.InlineView',

  ],

  methods:  [
    function init() {
      this.SUPER();
      GLOBAL.registerModel(this.StringPropertyView, 'StringPropertyView');
      GLOBAL.registerModel(this.BooleanPropertyView, 'BooleanPropertyView');
      GLOBAL.registerModel(this.FloatPropertyView, 'FloatPropertyView');
      GLOBAL.registerModel(this.IntPropertyView, 'IntPropertyView');
      GLOBAL.registerModel(this.PropertyView, 'PropertyView');

      GLOBAL.registerModel(this.StringPropertyEditView, 'StringPropertyEditView');
      GLOBAL.registerModel(this.BooleanPropertyEditView, 'BooleanPropertyEditView');
      GLOBAL.registerModel(this.FloatPropertyEditView, 'FloatPropertyEditView');
      GLOBAL.registerModel(this.IntPropertyEditView, 'IntPropertyEditView');
      GLOBAL.registerModel(this.PropertyEditView, 'PropertyEditView');

    }
  ],
});


