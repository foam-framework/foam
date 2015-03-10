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
  extendsModel: 'foam.ui.BaseView',
  
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
       
    createViewFromProperty: function(prop, ret) {
      /* Helper to determine the $$DOC{ref:'foam.ui.View'} to use. */
      var viewName = this.innerView || prop.view
      if ( ! viewName ) ret(this.TextFieldView.create(prop, this.Y));
      else if ( typeof viewName === 'string' ) {
//        var m = this.Y.lookup(viewName);
//        if ( m ) ret(m.create(prop, this.Y));
//        else 
          arequire(viewName, this.X)(function(m) { ret(m.create(prop, this.Y)); }.bind(this) );
      }
      else if ( viewName.model_ && typeof viewName.model_ === 'string' ) {
        var m = FOAM(prop.view);
        arequireModel(m, this.X)(ret);
      }
      else if ( viewName.model_ ) { 
        var v = viewName.model_.create(viewName, this.X);
        var vId = v.id;
        v.copyFrom(prop);
        v.id = vId;
        ret(v); 
      }
      else if ( viewName.factory_ ) {
        var v = this.X.lookup(viewName.factory_).create(viewName, this.X);
        var vId = v.id;
        v.copyFrom(prop);
        v.id = vId;
        ret(v);
      }
      else if ( typeof viewName === 'function' ) ret(viewName(prop, this));

      else ret(viewName.create(prop));
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

    destroy: function( isParentDestroyed ) { /* Passthrough to $$DOC{ref:'.view'} */
      // always unbind, since if our parent was the top level destroy we need
      // to unhook if we were created as an addSelfDataChild
      this.unbindData(this.data);
      this.SUPER( isParentDestroyed );
    },
    
    finishPropertyRender: function() { /* Implement to render your property. */ },
    
    construct: function() {
      // if not bound yet and we do have data set, bind it
      this.bindData(this.data);

      if ( this.args && this.args.model_ ) {
        var model = this.Y.lookup(this.args.model_);
        console.assert( model, 'Unknown View: ' + this.args.model_);
        // HACK to make sure model specification makes it into the create
        if ( this.args.model ) this.prop.model = this.args.model;
        var view = model.create(this.prop, this.Y);
        delete this.args.model_;
        // syncronous case
        this.finishConstruct(view, this.finishPropertyRender.bind(this));
      } else {
        view = this.createViewFromProperty(this.prop, 
                 function(v) { 
                   this.finishConstruct(v, this.finishPropertyRender.bind(this));
                 }.bind(this));
      }
    },

    finishConstruct: function(view, ret) {
      view.copyFrom(this.args);
      view.parent = this.parent;
      view.prop = this.prop;

      // TODO(kgr): re-enable when improved
      // if ( this.prop.description || this.prop.help ) view.tooltip = this.prop.description || this.prop.help;

      this.view = view;
      this.addDataChild(view);
            
      ret && ret();
    },
    
    addDataChild: function(child) {
      Events.link(this.childData$, child.data$);
      this.addChild(child);
    }
  },
  
});




