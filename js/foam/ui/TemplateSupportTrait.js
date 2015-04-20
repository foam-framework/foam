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
  name: 'TemplateSupportTrait',

  requires: [
    'foam.ui.PropertyView',
//    'foam.ui.ActionButton',
//    'foam.ui.RelationshipView',
    'foam.ui.AsyncViewLoader',
    'SimpleReadOnlyValue'
  ],

  documentation: function() {/* For Views that need to support templates
    to create children through $$DOC{ref:'.',text:'$$'} notation.
  */},

  methods: {
    init: function() {
      this.SUPER();
    },

    createView: function(prop, opt_args) {
      /* Creates a sub-$$DOC{ref:'foam.ui.View'} from $$DOC{ref:'Property'} info. */
      var X = ( opt_args && opt_args.X ) || this.Y;
      var v = this.PropertyView.create({id: (this.nextID ? this.nextID() : this.id) +'PROP', prop: prop, args: opt_args}, X);
      this[prop.name + 'View'] = v.view;
      return v;
    },

    removeChild: function(child) {
      if ( this.PropertyView.isInstance(child) && child.prop ) {
        delete this[child.prop.name + 'View'];
      }
      this.SUPER(child);
    },

    createRelationshipView: function(r, opt_args) {
      var X = ( opt_args && opt_args.X ) || this.Y;
      arequire('foam.ui.RelationshipView', X)(function(m) {
        var v = m.create({
          relationship: r,
          args: opt_args
        }, X);
        this[r.name + 'View'] = v;
      }.bind(this));
//      return this[r.name + 'View'];
    },
    createActionView: function(action, opt_args) {
      /* Creates a sub-$$DOC{ref:'foam.ui.View'} from $$DOC{ref:'Property'} info
        specifically for $$DOC{ref:'Action',usePlural:true}. */
      var X = ( opt_args && opt_args.X ) || this.Y;
      var modelName = opt_args && opt_args.model_ ?
        opt_args.model_ :
        'foam.ui.ActionButton'  ;

      var v = this.AsyncViewLoader.create({
        id: this.nextID(),
        name: action.name,
        model: modelName,
        args: { action: action },
        copyFrom: opt_args
      }, X);

      if ( v.view ) {
        v = v.view;
      }

      this[action.name + 'View'] = v;
      return v;
    },

    createTemplateView: function(name, opt_args) {
      /*
        Used by the $$DOC{ref:'Template',text:'$$propName'} sub-$$DOC{ref:'foam.ui.View'}
        creation tag in $$DOC{ref:'Template',usePlural:true}.
      */
      var args = opt_args || {};
      var X = this.Y;
      // Look for the property on our data first
      var myData = this.data$;
      if ( myData && myData.value && myData.value.model_ ) {
        var o = myData.value.model_.getFeature(name);
        //args.data$ = myData;
        if ( o ) {
          var v;
          if ( Action.isInstance(o) )
            v = this.createActionView(o, args);
          else if ( Relationship.isInstance(o) )
            v = this.createRelationshipView(o, args);
          else
            v = this.createView(o, args);
          // link data and add child view
          this.addDataChild(v);
          return v;
        }
      }
      // fallback to check our own properties
      var o = this.model_.getFeature(name);
      if ( ! o ) throw 'Unknown View Name: ' + name;
      //args.data = this;

      if ( Action.isInstance(o) )
        var v = this.createActionView(o, args);
      else if ( Relationship.isInstance(o) )
        v = this.createRelationshipView(o, args);
      else
        v = this.createView(o, args);
      // set this-as-data and add child view
      this.addSelfDataChild(v);
      return v;
    },

    dynamicTag: function(tagName, f) {
      /*
        Creates a dynamic HTML tag whose content will be automatically updated.
       */
      var id = this.nextID();

      this.addInitializer(function() {
        this.X.dynamic(function() {
          var html = f();
          var e = this.X.$(id);
          if ( e ) e.innerHTML = html;
        }.bind(this));
      }.bind(this));

      return '<' + tagName + ' id="' + id + '"></' + tagName + '>';
    },
  }
});
