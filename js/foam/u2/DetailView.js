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
  name: 'DetailView',

  extendsModel: 'foam.u2.Element',

  requires: [
    'Property',
    'foam.u2.PropertyView'
  ],

  properties: [
    {
      name: 'data',
      preSet: function(_, data) {
        if ( data.model_ !== this.model ) this.model = data.model_;
        return data;
      }
    },
    {
      name: 'model',
      postSet: function(oldModel, model) {
        console.assert(Model.isInstance(model), 'Invalid model specified for ' + this.name_);
        if ( oldModel !== model )
          this.properties = model.getRuntimeProperties().filter(function(p) { return ! p.hidden; });
        if ( ! oldModel || this.title === oldModel.label ) this.title = model.label;
      }
    },
    {
      name: 'properties'
    },
    {
      name: 'title',
      documentation: function() {/*
        <p>The display title for the $$DOC{ref:'foam.ui.View'}.
        </p>
      */}
    },
    [ 'nodeName', 'DIV' ]
  ],

  templates: [
    function CSS() {/*
      .u2-detailview {
        background: #f9f9f9;
      }
    */}
  ],

  methods: [
    function init() {
      this.SUPER();
      
      var self = this;

      this.cls('u2-detailview').add(function(model, properties) {
        if ( ! model ) return 'Set model or data.';

        var f = E().add(E('b').add(self.title$, E('br')));

        for ( var i = 0 ; i < properties.length ; i++ ) {
          var prop = properties[i];

          // self.data$.subValue(prop.name);
          //          f.add(prop.label, ' ', E('input'), E('br'));
          f.add(self.PropertyView.create({data$: self.data$, property: prop}));
        }

        return f;
      }.on$(this.X, this.model$, this.properties$));
    }
  ]
});