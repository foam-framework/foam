/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'DetailView',

  extends: 'foam.ui.View',

  requires: [
    'Property',
    'foam.ui.TextFieldView',
    'foam.ui.IntFieldView',
    'foam.ui.FloatFieldView',
    'foam.ui.DAOController'
  ],
  exports: [ 'propertyViewProperty' ],

  documentation: function() {/*
    When a default view based on $$DOC{ref:'Property'} values is desired, $$DOC{ref:'foam.ui.DetailView'}
    is the place to start. Either using $$DOC{ref:'foam.ui.DetailView'} directly, implementing
    a .toDetailHTML() $$DOC{ref:'Method'} in your model, or extending
    $$DOC{ref:'foam.ui.DetailView'} to add custom formatting.
    </p>
    <p>Set the $$DOC{ref:'.data'} $$DOC{ref:'Property'} to the $$DOC{ref:'Model'} instance
    you want to display. $$DOC{ref:'foam.ui.DetailView'} will extract the $$DOC{ref:'Model'}
    definition, create editors for the $$DOC{ref:'Property',usePlural:true}, and
    display the current values of your instance. Set $$DOC{ref:'.mode',usePlural:true}
    to indicate read-only if desired.
    </p>
    <p>$$DOC{ref:'Model',usePlural:true} may specify a .toDetailHTML() $$DOC{ref:'Method'} or
    $$DOC{ref:'Template'} to render their contents instead of
    $$DOC{ref:'foam.ui.DetailView.defaultToHTML'}.
    </p>
    <p>For each $$DOC{ref:'Property'} in the $$DOC{ref:'.data'} instance specified,
    a $$DOC{ref:'PropertyView'} is created that selects the appropriate $$DOC{ref:'foam.ui.View'}
    to construct.
  */},

  properties: [
    {
      name: 'className',
      defaultValue: 'detailView',
      documentation: function() {/*
          The CSS class names to use for HTML $$DOC{ref:'foam.ui.View',usePlural:true}.
          Separate class names with spaces. Each instance of a $$DOC{ref:'foam.ui.DetailView'}
          may have different classes specified.
      */}
    },
    {
      name: 'data',
      preSet: function(old,nu) {
        if ( nu.model_ ) {
          this.model = nu.model_;
        }
        return nu;
      }
    },
    {
      name: 'model',
      // TODO: Add declarative runtime type checking
      postSet: function(_, model) {
        console.assert(Model.isInstance(model), 'Invalid model specified for ' + this.name_);
      }
    },
    {
      name: 'title',
      defaultValueFn: function() {
        return /*(this.data && this.data.id ? 'Edit ' : 'New ') +*/ this.model.label;
      },
      documentation: function() {/*
        <p>The display title for the $$DOC{ref:'foam.ui.View'}.
        </p>
      */}
    },
    {
      type: 'String',
      name: 'mode',
      defaultValue: 'read-write',
      documentation: function() {/*
        The editing mode. To disable editing set to 'read-only'.
      */}
    },
    {
      type: 'Boolean',
      name: 'showRelationships',
      defaultValue: false,
      documentation: function() {/*
        Set true to create sub-views to display $$DOC{ref:'Relationship',usePlural:true}
        for the $$DOC{ref:'.model'}.
      */}
    },
    {
      name: 'propertyViewProperty',
      type: 'Property',
      defaultValueFn: function() { return this.Property.DETAIL_VIEW; }
    }
  ],

  methods: {
    // Template Method

    shouldDestroy: function(old,nu) {
      if ( ! old || ! old.model_ || ! nu || ! nu.model_ ) return true;
      return old.model_ !== nu.model_;
    },

    generateContent: function() { /* rebuilds the children of the view */
      if ( ! this.$ ) return;
      this.$.outerHTML = this.toHTML();
      this.initHTML();
    },

    titleHTML: function() {
      /* Title text HTML formatter */
      var title = this.title;

      return title ?
        '<tr><td colspan="2" class="heading">' + title + '</td></tr>' :
        '';
    },

    startForm: function() { /* HTML formatter */ return '<table>'; },
    endForm: function() { /* HTML formatter */ return '</table>'; },

    startColumns: function() { /* HTML formatter */ return '<tr><td colspan=2><table valign=top><tr><td valign=top><table>'; },
    nextColumn:   function() { /* HTML formatter */ return '</table></td><td valign=top><table valign=top>'; },
    endColumns:   function() { /* HTML formatter */ return '</table></td></tr></table></td></tr>'; },

    rowToHTML: function(prop, view) {
      /* HTML formatter for each $$DOC{ref:'Property'} row. */
      var str = '';

      if ( prop.detailViewPreRow ) str += prop.detailViewPreRow(this);

      str += '<tr class="detail-' + prop.name + '">';
      if ( this.DAOController.isInstance(view) ) {
        str += "<td colspan=2><div class=detailArrayLabel>" + prop.label + "</div>";
        str += view.toHTML();
        str += '</td>';
      } else {
        str += "<td class='label'>" + prop.label + "</td>";
        str += '<td>';
        str += view.toHTML();
        str += '</td>';
      }
      str += '</tr>';

      if ( prop.detailViewPostRow ) str += prop.detailViewPostRow(this);

      return str;
    },

    // If the Model supplies a toDetailHTML method, then use it instead.
    toHTML: function() {
      /* Overridden to create the complete HTML content for the $$DOC{ref:'foam.ui.View'}.</p>
         <p>$$DOC{ref:'Model',usePlural:true} may specify a .toDetailHTML() $$DOC{ref:'Method'} or
         $$DOC{ref:'Template'} to render their contents instead of the
          $$DOC{ref:'foam.ui.DetailView.defaultToHTML'} we supply here.
      */

      if ( ! this.data ) return '<span id="' + this.id + '"></span>';

      if ( ! this.model ) throw "DetailView: either 'data' or 'model' must be specified.";

      return (this.model.getPrototype().toDetailHTML || this.defaultToHTML).call(this);
    },

    getDefaultProperties: function() {
      return this.model.getRuntimeProperties();
    },

    defaultToHTML: function() {
      /* For $$DOC{ref:'Model',usePlural:true} that don't supply a .toDetailHTML()
        $$DOC{ref:'Method'} or $$DOC{ref:'Template'}, a default listing of
        $$DOC{ref:'Property'} editors is implemented here.
        */
      this.children = [];
      var model = this.model;
      var str  = "";

      str += '<div id="' + this.id + '" ' + this.cssClassAttr() + '" name="form">';
      str += this.startForm();
      str += this.titleHTML();

      var properties = this.getDefaultProperties();
      for ( var i = 0 ; i < properties.length ; i++ ) {
        var prop = properties[i];

        if ( prop.hidden ) continue;

        var view = this.createView(prop);
        //view.data$ = this.data$;
        this.addDataChild(view);
        str += this.rowToHTML(prop, view);
      }

      str += this.endForm();

      if ( this.showRelationships ) {
        var view = this.X.lookup('foam.ui.RelationshipsView').create({
          data: this.data
        });
        //view.data$ = this.data$;
        this.addDataChild(view);
        str += view.toHTML();
      }

      str += '</div>';

      return str;
    }
  },

  templates: [
    {
      name: 'CSS',
      template: function CSS() {/*
          .detailView {
            border: solid 2px #dddddd;
            background: #fafafa;
            display: table;
          }

          .detailView .heading {
            color: black;
            float: left;
            font-size: 16px;
            margin-bottom: 8px;
            padding: 2px;
          }

          .detailView .propertyLabel {
            font-size: 14px;
            display: block;
            font-weight: bold;
            text-align: right;
            float: left;
          }

          .detailView input {
            font-size: 12px;
            padding: 4px 2px;
            border: solid 1px #aacfe4;
            margin: 2px 0 0px 10px;
          }

          .detailView textarea {
            float: left;
            font-size: 12px;
            padding: 4px 2px;
            border: solid 1px #aacfe4;
            margin: 2px 0 0px 10px;
            width: 98%;
            overflow: auto;
          }

          .detailView select {
            font-size: 12px;
            padding: 4px 2px;
            border: solid 1px #aacfe4;
            margin: 2px 0 0px 10px;
          }

          .detailView .label {
            color: #444;
            font-size: smaller;
            padding-left: 6px;
            padding-top: 8px;
            vertical-align: top;
          }

          .detailArrayLabel {
            font-size: medium;
          }

          .detailArrayLabel .foamTable {
            margin: 1px;
          }
      */}
    }
  ]
});
