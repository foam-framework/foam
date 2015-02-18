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
  name: 'BasePropertyView',
  package: 'foam.ui',
  extendsModel: 'foam.ui.LeafDataView',
  
  requires: ['foam.ui.TextFieldView'],
  
  documentation: function() {/*
    Apply this trait to a $$DOC{ref:'BaseView'} (such as $$DOC{ref:'HTMLView'}).</p>
    <p>Used by $$DOC{ref:'foam.ui.DetailView'} to generate a sub-$$DOC{ref:'foam.ui.View'} for one
    $$DOC{ref:'Property'}. The $$DOC{ref:'foam.ui.View'} chosen can be based off the
    $$DOC{ref:'Property.view',text:'Property.view'} value, the $$DOC{ref:'.innerView'} value, or
    $$DOC{ref:'.args'}.model_.
  */},

  properties: [
    {
      name: 'prop',
      type: 'Property',
      documentation: function() {/*
          The $$DOC{ref:'Property'} for which to generate a $$DOC{ref:'foam.ui.View'}.
      */},
      postSet: function(old, nu) {
        if ( old && this.bound_ ) this.unbindData(this.data);
        if ( nu && ! this.bound_ ) this.bindData(this.data);
      }
    },
    {
      name: 'data',
      documentation: function() {/*
          The $$DOC{ref:'.data'} for which to generate a $$DOC{ref:'foam.ui.View'}.
      */},
      postSet: function(old, nu) {
        if ( old && this.bound_ ) this.unbindData(old);
        if ( nu ) this.bindData(nu);
      }
    },
    {
      name: 'childData'
    },
    {
      name: 'parent',
      type: 'foam.ui.View',
      postSet: function(_, p) {
        if (!p) return; // TODO(jacksonic): We shouldn't pretend we aren't part of the tree
        p[this.prop.name + 'foam.ui.View'] = this.view;
        if ( this.view ) this.view.parent = p;
      },
      documentation: function() {/*
        The $$DOC{ref:'foam.ui.View'} to use as the parent container for the new
        sub-$$DOC{ref:'foam.ui.View'}.
      */}
    },
    {
      name: 'innerView',
      help: 'Override for prop.view',
      documentation: function() {/*
        The optional name of the desired sub-$$DOC{ref:'foam.ui.View'}. If not specified,
        prop.$$DOC{ref:'Property.view'} is used.
      */}
    },
    {
      name: 'view',
      type: 'foam.ui.View',
      documentation: function() {/*
        The new sub-$$DOC{ref:'foam.ui.View'} generated for the given $$DOC{ref:'Property'}.
      */}
    },
    {
      name: 'args',
      documentation: function() {/*
        Optional arguments to be used for sub-$$DOC{ref:'foam.ui.View'} creation. args.model_
        in particular specifies the exact $$DOC{ref:'foam.ui.View'} to use.
      */}
    },
    {
      name: 'bound_',
      model_: 'BooleanProperty',
      defaultValue: false
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.construct();
    },

    fromElement: function(e) {
      this.view.fromElement(e);
      return this;
    },
       
    createViewFromProperty: function(prop) {
      /* Helper to determine the $$DOC{ref:'foam.ui.View'} to use. */
      var viewName = this.innerView || prop.view
      if ( ! viewName ) return this.TextFieldView.create(prop, this.X);
      if ( typeof viewName === 'string' ) return FOAM.lookup(viewName, this.X).create(prop, this.X);
      if ( viewName.model_ && typeof viewName.model_ === 'string' ) return FOAM(prop.view);
      if ( viewName.model_ ) { 
        var v = viewName.model_.create(viewName, this.X);
        var vId = v.id;
        v.copyFrom(prop);
        v.id = vId;
        return v; 
      }
      if ( viewName.factory_ ) {
        var v = FOAM.lookup(viewName.factory_, this.X).create(viewName, this.X);
        var vId = v.id;
        v.copyFrom(prop);
        v.id = vId;
        return v;
      }
      if ( typeof viewName === 'function' ) return viewName(prop, this);

      return viewName.create(prop);
    },

    unbindData: function(oldData) {
      if ( ! this.bound_ || ! oldData || ! this.prop ) return;
      var pValue = oldData.propertyValue(this.prop.name);
      Events.unlink(pValue, this.childData$);
      this.bound_ = false;
    },

    bindData: function(data) {
      if ( this.bound_ || ! data || ! this.prop) return;
      var pValue = data.propertyValue(this.prop.name);
      Events.link(pValue, this.childData$);
      this.bound_ = true;
    },


    toString: function() { /* Name info. */ return 'PropertyView(' + this.prop.name + ', ' + this.view + ')'; },

    destroy: function() { /* Passthrough to $$DOC{ref:'.view'} */
      this.unbindData(this.data);
      //this.view.destroy(); addChild instead
      this.SUPER();
    },
    
    construct: function() {
      this.SUPER();

      // if not bound yet and we do have data set, bind it
      this.bindData(this.data);

      if ( this.args && this.args.model_ ) {
        var model = FOAM.lookup(this.args.model_, this.X);
        console.assert( model, 'Unknown View: ' + this.args.model_);
        // HACK to make sure model specification makes it into the create
        if ( this.args.model ) this.prop.model = this.args.model;
        var view = model.create(this.prop, this.X);
        delete this.args.model_;
      } else {
        view = this.createViewFromProperty(this.prop);
      }

      view.copyFrom(this.args);
      view.parent = this.parent;
      view.prop = this.prop;
      view.data$ = this.childData$;

      // TODO(kgr): re-enable when improved
      // if ( this.prop.description || this.prop.help ) view.tooltip = this.prop.description || this.prop.help;

      this.view = view;
      this.addChild(view);
    }
  },
  
});




