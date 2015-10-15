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
  package: 'foam.documentation.new',
  name: 'DocBrowser',
  extends: 'foam.ui.View',
  requires: [
    'foam.documentation.new.DocFeatureInheritanceTracker',
    'foam.documentation.new.InheritanceEngine',
    'foam.documentation.new.ui.ModelDocView',
    'Model',
    'MDAO',
    'foam.dao.FindFallbackDAO',
  ],

  exports: [
    'FEATURE_TYPES',
    'documentViewRef',
    'modelDAO',
  ],

  constants: {
    FEATURE_TYPES: [
      'properties',
      'methods',
      'listeners',
      'actions',
      'templates',
      'relationships',
    ],
  },

  properties: [
    {
      name: 'documentViewRef',
      factory: function() {
        var ref = typeof this.data === 'string' ?  this.data :
            (this.data ? this.data.id : '');
        return this.SimpleValue.create(ref);
      }
    },
    {
      name: 'modelDAO',
      factory: function() {
        return this.X.ModelDAO;
      }
    },
    {
      name: 'engine',
      factory: function() {
        return this.InheritanceEngine.create();
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <div class="doc-browser">
        <div id="<%= this.id %>-inner" class="doc-browser-model">
          <% this.addInitializer(function() {
            var ref = self.documentViewRef.get();
            if (ref) {
              self.engine.loadModel(ref)(function(docs) {
                var view = self.ModelDocView.create({ data: docs });
                self.X.$(self.id + '-inner').innerHTML = view.toHTML();
                view.initHTML();
              });
            }
          }); %>
        </div>
      </div>
    */},
  ]
});
