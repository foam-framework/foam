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
 



// Bring in classic views and upgrade data handling
CLASS({
  name:  'TextFieldView',
  package: 'foam.ui',
  label: 'Text Field',

  extendsModel: 'TextFieldView',
  traits: ['foam.ui.DataViewTrait']
});

CLASS({
  name: 'ActionButton',
  package: 'foam.ui',
  traits: ['foam.ui.DataViewTrait'],
  extendsModel: 'ActionButton',
});


//
// CLASS({
//   name: 'AbstractDAOView',
//   package: 'foam.ui',
//
//   extendsModel: 'AbstractDAOView',
//   traits: ['foam.ui.DataConsumerTrait'],
//
// });

CLASS({
  name: 'DAODataTrait',
  package: 'foam.ui',
  
  documentation: function() { /*
     <p>For $$DOC{ref:'View',usePlural:true} that take data items from a $$DOC{ref:'DAO'}
     and display them all, $$DOC{ref:'.'} provides the basic interface. Set or bind
     either $$DOC{ref:'.data'} or $$DOC{ref:'.dao'} to your source $$DOC{ref:'DAO'}.</p>
     <p>Call $$DOC{ref:'.onDAOUpdate'} to indicate a data change that should be
      re-rendered.</p>
  */},

  exports: ['dao$ as daoViewCurrentDAO$'],

  properties: [
    {
      name: 'data',
      postSet: function(oldDAO, dao) {
        if ( this.dao !== dao ) {
          this.dao = dao;
        }
      },
      documentation: function() { /*
          Sets the $$DOC{ref:'DAO'} to render items from. Use $$DOC{ref:'.data'}
          or $$DOC{ref:'.dao'} interchangeably.
      */}
    },
    {
      model_: 'DAOProperty',
      name: 'dao',
      label: 'DAO',
      help: 'An alias for the data property.',
      onDAOUpdate: 'onDAOUpdate',
      postSet: function(oldDAO, dao) {
        if (!dao) {
          this.data = "";
        } else if ( this.data !== dao ) {
          this.data = dao;
        }
      },
      documentation: function() { /*
          Sets the $$DOC{ref:'DAO'} to render items from. Use $$DOC{ref:'.data'}
          or $$DOC{ref:'.dao'} interchangeably.
      */}
    }
  ],

  methods: {
    onDAOUpdate: function() { /* Implement this $$DOC{ref:'Method'} in
          sub-models to respond to changes in $$DOC{ref:'.dao'}. */ }
  }
});


CLASS({
  name: 'DAOListView',
  package: 'foam.ui',
  
  requires: ['SimpleValue'],
  
  traits: ['foam.patterns.ChildTreeTrait',
           'foam.ui.LeafDataViewTrait',
           'foam.ui.TemplateSupportTrait',
           'foam.ui.DAODataTrait',
           'foam.ui.HTMLViewTrait'], 
  // see updateHTML, item X.sub({data...}) for differences from old DAOListView
  
  properties: [
    {
      model_: 'BooleanProperty',
      name: 'isHidden',
      defaultValue: false,
      postSet: function(_, isHidden) {
        if ( this.dao && ! isHidden ) this.onDAOUpdate();
      }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'rowView',
      defaultValue: 'DetailView'
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
      view: { factory_: 'ChoiceView', choices: ['read-only', 'read-write', 'final'] }
    },
    {
      name: 'useSelection',
      help: 'Backward compatibility for selection mode. Create a X.selection$ value in your context instead.',
      postSet: function(old, nu) {
        if ( this.useSelection && !this.X.selection$ ) this.X.selection$ = this.SimpleValue.create();
        this.selection$ = this.X.selection$;
      }
    },
    {
      name: 'selection',
      help: 'Backward compatibility for selection mode. Create a X.selection$ value in your context instead.',
      factory: function() {
        return this.SimpleValue.create();
      }
    },
    {
      name: 'scrollContainer',
      help: 'Containing element that is responsible for scrolling.'
    },
    {
      name: 'chunkSize',
      defaultValue: 0,
      help: 'Number of entries to load in each infinite scroll chunk.'
    },
    {
      name: 'chunksLoaded',
      isHidden: true,
      defaultValue: 1,
      help: 'The number of chunks currently loaded.'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      this.subscribe(this.ON_HIDE, function() {
        self.isHidden = true;
      });

      this.subscribe(this.ON_SHOW, function() {
        self.isHidden = false;
      });

      // bind to selection, if present
      if (this.X.selection$) {
        this.selection$ = this.X.selection$;
      }
    },

    initHTML: function() {
      this.SUPER();

      // If we're doing infinite scrolling, we need to find the container.
      // Either an overflow: scroll element or the window.
      // We keep following the parentElement chain until we get null.
      if ( this.chunkSize > 0 ) {
        var e = this.$;
        while ( e ) {
          if ( window.getComputedStyle(e).overflow === 'scroll' ) break;
          e = e.parentElement;
        }
        this.scrollContainer = e || window;
        this.scrollContainer.addEventListener('scroll', this.onScroll, false);
      }

      if ( ! this.isHidden ) this.updateHTML();
    },

    construct: function() {
      if ( ! this.dao || ! this.$ ) return;
      if ( this.painting ) return;
      this.painting = true;

      var out = [];
      this.children = [];
      this.initializers_ = [];

      var doneFirstItem = false;
      var d = this.dao;
      if ( this.chunkSize ) {
        d = d.limit(this.chunkSize * this.chunksLoaded);
      }
      d.select({put: function(o) {
        if ( this.mode === 'read-write' ) o = o.model_.create(o, this.X); //.clone();
        var X = this.X.sub({ data$: this.X.SimpleValue.create(o, this.X) });
        var view = this.rowView({ model: o.model_}, X);
        view.DAO = this.dao;
        if ( this.mode === 'read-write' ) {
          o.addListener(function() {
            // TODO(kgr): remove the deepClone when the DAO does this itself.
            this.dao.put(o.deepClone());
          }.bind(this, o));
        }
        this.addChild(view);
        
        if (!doneFirstItem) {
          doneFirstItem = true;
        } else {
          this.separatorToHTML(out); // optional separator
        }
        
        if ( this.X.selection$ ) {
          out.push('<div class="' + this.className + '-row' + '" id="' + this.on('click', (function() {
            this.selection = o;
          }).bind(this)) + '">');
        }
        out.push(view.toHTML());
        if ( this.X.selection$ ) {
          out.push('</div>');
        }
      }.bind(this)})(function() {
        var e = this.$;

        if ( ! e ) return;

        e.innerHTML = out.join('');
        this.initInnerHTML();
        this.children = [];
        this.painting = false;
      }.bind(this));
    },

    /** Allow rowView to be optional when defined using HTML. **/
    fromElement: function(e) {
      var children = e.children;
      if ( children.length == 1 && children[0].nodeName === 'rowView' ) {
        this.SUPER(e);
      } else {
        this.rowView = e.innerHTML;
      }
    },
    
    // Template method
    separatorToHTML: function(out) {
      /* Template method. Override to provide a separator if required. This
      method is called <em>before</em> each list item, except the first. Use
      out.push("<myhtml>...") for efficiency. */
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() {
        this.realDAOUpdate();
      }
    },
    {
      name: 'realDAOUpdate',
      isFramed: true,
      code: function() { 
        if ( ! this.isHidden ) this.updateHTML(); 
      }
    },
    {
      name: 'onScroll',
      code: function() {
        var e = this.scrollContainer;
        if ( this.chunkSize > 0 && e.scrollTop + e.offsetHeight >= e.scrollHeight ) {
          this.chunksLoaded++;
          this.updateHTML();
        }
      }
    }
  ]
});


CLASS({
  name: 'CollapsibleView',
  package: 'foam.ui',
  traits: ['foam.patterns.ChildTreeTrait',
           'foam.ui.SimpleViewTrait',
           'foam.ui.ViewActionsTrait',
           'foam.ui.HTMLViewTrait'],
  
  properties: [
    {
      name:  'fullView',
      documentation: function() {/*
        The large, expanded view to show.
      */}
    },
    {
      name:  'collapsedView',
      documentation: function() {/*
        The small, hidden mode view to show.
      */}

    },
    {
      name: 'collapsed',
      documentation: function() {/*
        Indicates if the collapsed or full view is shown. 
      */},
      defaultValue: true,
      postSet: function() {
        if (this.collapsed) {
          this.collapsedView.$.style.height = "";
          this.fullView.$.style.height = "0";

        } else {
          this.collapsedView.$.style.height = "0";
          this.fullView.$.style.height = "";
        }
      }
    }

  ],

  methods: {
    toHTML: function() {
      /* Just render both sub-views, and control their height to show or hide. */

      // TODO: don't render full view until expanded for the first time?
      if (this.collapsedView && this.fullView) {
        var retStr = this.collapsedView.toHTML() + this.fullView.toHTML();
        this.addChild(this.collapsedView);
        this.addChild(this.fullView);
      } else {
        console.warn(model_.id + " missing " 
            + ( this.collapsedView ? "" : "collapsedView" )
            + ( this.fullView ? "" : "fulleView" ));
      }
      return retStr;
    },

    initHTML: function() {
      this.SUPER();
      /* Just render both sub-views, and control their height to show or hide. */

      if (this.collapsedView.$ && this.fullView.$) {        
        // to ensure we can hide by setting the height
        this.collapsedView.$.style.display = "block";
        this.fullView.$.style.display = "block";
        this.collapsedView.$.style.overflow = "hidden";
        this.fullView.$.style.overflow = "hidden";
        this.collapsed = true;
      }
    }
  },

  actions: [
    {
      name:  'toggle',
      help:  'Toggle collapsed state.',

      labelFn: function() {
        return this.collapsed? 'Expand' : 'Hide';
      },
      isAvailable: function() {
        return true;
      },
      isEnabled: function() {
        return true;//this.collapsedView.toHTML && this.fullView.toHTML;
      },
      action: function() {
        this.collapsed = !this.collapsed;
      }
    },
  ]
});




