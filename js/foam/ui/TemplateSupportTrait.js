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
  name: 'TemplateSupportTrait',
  package: 'foam.ui',
  
  requires: ['foam.ui.PropertyView', 'ActionButton', 'SimpleReadOnlyValue'],
  
  documentation: function() {/* For Views that need to support templates
    to create children through $$ notation.
  */},

  methods: {
  
    createView: function(prop, opt_args) {
      /* Creates a sub-$$DOC{ref:'View'} from $$DOC{ref:'Property'} info. */
      var X = ( opt_args && opt_args.X ) || this.X;
      var v = this.PropertyView.create({prop: prop, args: opt_args}, X);
      this.addChild(v);
      return v;
    },

    createActionView: function(action, opt_args) {
      /* Creates a sub-$$DOC{ref:'View'} from $$DOC{ref:'Property'} info
        specifically for $$DOC{ref:'Action',usePlural:true}. */
      var X = ( opt_args && opt_args.X ) || this.X;
      var modelName = opt_args && opt_args.model_ ?
        opt_args.model_ :
        'ActionButton'  ;
      var v = FOAM.lookup(modelName, X).create({action: action}).copyFrom(opt_args);

      this[action.name + 'View'] = v;

      return v;
    },

    createRelationshipView: function(r, opt_args) {
      var X = ( opt_args && opt_args.X ) || this.X;
      return X.foam.ui.RelationshipView.create({
        relationship: r,
        args: opt_args
      });
    },

    createTemplateView: function(name, opt_args) {
      /*
        Used by the $$DOC{ref:'Template',text:'$$propName'} sub-$$DOC{ref:'View'}
        creation tag in $$DOC{ref:'Template',usePlural:true}.
      */
      var args = opt_args || {};
      var X = this.childX || this.X;
      // Look for the property on our data first
      var myData = this.childDataValue || this.data$;
      if ( myData && myData.value && myData.value.model_ ) {
        var o = myData.value.model_.getFeature(name);
        if ( o ) {
          args.X = X.sub({ data$: myData });
          var v;
          if ( Action.isInstance(o) )
            v = this.createActionView(o, args);
          else if ( Relationship.isInstance(o) )
            v = this.createRelationshipView(o, args);
          else
            v = this.createView(o, args);
          return v;
        }
      } 
      // fallback to check our own properties
      var o = this.model_.getFeature(name);  
      if ( ! o ) throw 'Unknown View Name: ' + name;

      // export self as data
      args.X = this.X.sub({ data$: this.SimpleReadOnlyValue.create(this) });

      if ( Action.isInstance(o) )
        var v = this.createActionView(o, args);
      else if ( Relationship.isInstance(o) )
        v = this.createRelationshipView(o, args);
      else
        v = this.createView(o, args);
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
