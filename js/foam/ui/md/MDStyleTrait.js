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
  name: 'MDStyleTrait',
  package: 'foam.ui.md',

  documentation: function() {/* Provides standard styling options and
    CSS for foam.ui.md views. */},

  properties: [
    {
      name: 'inlineStyle',
      model_: 'BooleanProperty',
      defaultValue: false,
      documentation: function() {/* When true, tightens margins and padding
        to their minimums to allow easy baseline alignment of MD views and
        other elements.
      */},
    }
  ],

  methods: {
    setMDClasses: function() {
      this.setClass('md-style-trait-inline', function() { return this.inlineStyle; }, this.id);
      this.setClass('md-style-trait-standard', function() { return ! this.inlineStyle; }, this.id);
    }
  }

});
