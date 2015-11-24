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

  extends: 'foam.u2.View',

  requires: [
    'Property',
    'foam.u2.DetailPropertyView'
  ],

  exports: [ 'data$', 'data' ],

  properties: [
    {
      name: 'data',
      postSet: function(_, data) {
        if ( data.model_ !== this.model ) this.model = data.model_;
      }
    },
    {
      name: 'model',
      postSet: function(oldModel, model) {
        console.assert(Model.isInstance(model), 'Invalid model specified for ' + this.name_);
        if ( oldModel !== model )
          this.properties = model.getRuntimeProperties().filter(function(p) { return ! p.hidden; });
        if ( ( ! oldModel && ! this.hasOwnProperty('title') ) || this.title === oldModel.label ) this.title = model.label;
      }
    },
    {
      type: 'Boolean',
      name: 'showActions'
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
    [ 'nodeName', 'div' ]
  ],

  templates: [
    function CSS() {/*
      .foam-u2-DetailView {
        background: #fdfdfd;
        border: solid 1px #dddddd;
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        display: inline-block;
        margin: 5px;
      }
      .foam-u2-DetailView table {
        padding-bottom: 2px;
      }
      .foam-u2-DetailView-title {
        color: #333;
        float: left;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        padding: 2px;
      }
      .foam-u2-DetailView input {
        border: solid 1px #aacfe4;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        padding: 4px 2px;
      }
      .foam-u2-DetailView textarea {
        border: solid 1px #aacfe4;
        float: left;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        overflow: auto;
        padding: 4px 2px;
        width: 98%;
      }
      .foam-u2-DetailView select {
        border: solid 1px #aacfe4;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        padding: 4px 2px;
      }
    */}
  ],

  methods: [
    function init() {
      this.SUPER();

      this.Y.registerModel(this.DetailPropertyView, 'foam.u2.PropertyView');

      this.add(function(model, properties) {
        if ( ! model ) return 'Set model or data.';

        return this.actionBorder(
          this.E('table').cls('foam-u2-DetailView').
            start('tr').
              start('td').cls('foam-u2-DetailView-title').attrs({colspan: 2}).
                add(this.title$).
              end().
            end().
            add(properties));
      }.bind(this).on$(this.Y, this.model$, this.properties$));
    },
    function actionBorder(e) {
      if ( ! this.showActions || ! this.model.actions.length ) return e;

      return this.Y.E().add(e).start('div').add(this.model.actions).end();
    },
    function elementForFeature(fName) {
      var f = this.model_.getFeature(fName) || this.X.data.model_.getFeature(fName);
      return f ? f.toE(this.Y) : this.E('Unknown feature: ' + fName).style({color: 'red'});
    }
  ]
});
