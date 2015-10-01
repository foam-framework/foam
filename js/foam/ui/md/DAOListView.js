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

// TODO(kgr): remove use of SimpleValue, just use data$ binding instead.
CLASS({
  package: 'foam.ui.md',
  name: 'DAOListView',

  requires: ['SimpleValue'],

  extendsModel: 'foam.ui.SimpleView',
  traits: ['foam.ui.DAODataViewTrait'],

  constants: {
    ROW_CLICK: ['row-click']
  },

  imports: [
    'selection$'
  ],

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
      name: 'tagName',
      defaultValue: 'div',
    },
    {
      name: 'orientation',
      view: { factory_: 'foam.ui.ChoiceView', choices: ['vertical', 'horizontal'] },
      defaultValue: 'vertical',
    },
    {
      name: 'rowCache_',
      factory: function() { return {}; },
    },
    {
      name: 'data',
      postSet: function(old,nu) {
        if ( old ) {
          old.unlisten(this);
          this.daoRemovalCheck();
        }
        if ( nu ) {
          this.count_ = 0;
          nu.pipe(this);
        }
      }
    },
    {
      name: 'count_',
      hidden: true,
      documentation: 'Internal tracker of insertion order',
      defaultValue: 0,
    },
    {
      name: 'removalCheck_',
      model_: 'BooleanProperty',
      documentation: 'Internal tracker of removal check sweep.',
      defaultValue: false,
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'rowView',
      defaultValue: 'foam.ui.DetailView'
    },

  ],

  methods: {

    init: function() {
      this.SUPER();

      // reset selection$ in case of nested list views
      this.Y.set('selection$', undefined);
    },

    put: function(o) {
      /* Sink function to receive updates from the dao */
      if ( this.rowCache_[o.id] ) {
        //console.log("put cached", o.id);
        var d = this.rowCache_[o.id];
        if ( ! equals(d.view.data, o) ) d.view.data = o;
        if ( d.ordering < 0 ) d.ordering = this.count_++; // reset on removal check
      } else {
        //console.log("put new", o.id);

        if ( this.mode === 'read-write' ) o = o.model_.create(o, this.Y); //.clone();
        var view = this.rowView({data: o, model: o.model_}, this.Y);
        // TODO: Something isn't working with the Context, fix
        view.DAO = this.dao;
        if ( this.mode === 'read-write' ) {
          o.addPropertyListener(null, function(o, topic) {
            var prop = o.model_.getProperty(topic[1]);
            // TODO(kgr): remove the deepClone when the DAO does this itself.
            if ( ! prop.transient ) {
              // TODO: if o.id changed, remove the old one?
              view.DAO.put(o.deepClone());
            }
          });
        }
        this.addChild(view);
        this.rowCache_[o.id] = { view: view, ordering: this.count_++ };
        //this.onDAOUpdate();
      }
    },

    remove: function(o) {
      /* Sink function to receive updates from the dao */
      if ( this.rowCache_[o.id] ) {
        //console.log("remove", o.id);
        var r = this.rowCache_[o.id];
        var v = r.view;
        v.destroy();
        if ( v.$ ) {
          var otherOffset = ( this.orientation == 'vertical' ) ?  -v.$.offsetWidth : -v.$.offsetHeight;
          if (  this.orientation == 'vertical' ) {
            v.$.style.transform = v.$.style.webkitTransform =
              "translate3d("+otherOffset+"px, "+r.offset+"px, 0px)";
          } else {
            v.$.style.transform = v.$.style.webkitTransform =
              "translate3d("+r.offset+"px, "+otherOffset+"px, 0px)";
          }
          this.X.setTimeout(function() { if (v.$) v.$.outerHTML = ""; }, 500);
        }
        this.removeChild(v);
        delete this.rowCache_[o.id];
        //this.onDAOUpdate();
      }
    },

    eof: function() {
      /* Sink function to receive updates from the dao */
      this.count_ = 0;

      // removal check completion...
      // remove items that were not added back in
      if ( this.removalCheck_ ) {
        this.removalCheck_ = false;
        for (var key in this.rowCache_) {
          if ( this.rowCache_[key].ordering == -1 ) {
            this.remove({ id: key });
          }
        }
      }

      this.daoChange();
    },


    bindSelection: function(d) {
      d.view.on('click', (function() {
        this.selection = d.view.data;
        this.publish(this.ROW_CLICK);
      }).bind(this), d.view.id);
       d.view.setClass('dao-selected', function() {
        return equals(this.selection.id, d.view.data.id);
      }.bind(this), d.view.id);
    },

    daoChange: function() {
      if ( ! this.dao || ! this.$ ) return;
      // build missing views for new items
      var outHTMLs = []; // string contents and existing nodes
      var toInit = []; // newly html'd views to init
      for (var key in this.rowCache_) {
        var d = this.rowCache_[key];

        if ( d.view.$ ) {
          outHTMLs[d.ordering] = d.view.$;
        } else {
          outHTMLs[d.ordering] = d.view.toHTML();
          // TODO(jacksonic): Wrap views so we don't have to fiddle with their real style tags
          if ( this.X.selection$ ) {
            this.bindSelection(d);
          }

          toInit.push(d);
          this.addChild(d.view);
        }
      }

      // create nodes for the strings, and insert between the existing nodes
      var firstTextItem = -1;
      for (var i = 0; i < outHTMLs.length; ++i) {
        // if text, remember the first one in the range.
        if ( outHTMLs[i] ) {
          if ( ! outHTMLs[i].nodeType ) { // outHTMLs[i] is string
            if ( firstTextItem < 0 ) {
              firstTextItem = i;
            }
          } else if ( firstTextItem >= 0 ) { // outHTMLs[i] is node
            // it's a node, so process and insert accumulated text before it
            // range [ firstTextItem , i-1 ]
            var node = outHTMLs[i];
            var html = "";
            for (var j = firstTextItem; j < i; ++j) {
              if ( outHTMLs[j] ) {
                html += outHTMLs[j];
              }
            }
            var el = this.X.document.createElement('div');
            node.parentNode.insertBefore(el, node);
            el.outerHTML = html;
            firstTextItem = -1;
          }
        }
      }

      if ( firstTextItem >= 0 ) {
        // no node found, so initialize
        var html = "";
        for (var j = firstTextItem; j < outHTMLs.length; ++j) {
          if ( outHTMLs[j] ) {
            html += outHTMLs[j];
          }
        }
        var el = this.X.document.createElement('div');
        this.$.appendChild(el);
        el.outerHTML = html;
        firstTextItem = -1;
      }

      // init the newly inserted views
      for (var i = 0; i < toInit.length; ++i) {
        toInit[i].view.initHTML();
        toInit[i].view.$.style.position = 'absolute';
        toInit[i].view.$.style.display = 'none';
      }

      this.updatePositions();
      this.X.setTimeout(this.onPositionUpdate, 100); // for lack of a resize event
      this.X.setTimeout(this.onPositionUpdate, 1000);
      //console.log("daoChange added", debugCount, " of ", this.children.length);
    },

    construct: function() {
      if ( ! this.dao || ! this.$ ) return;

      if ( this.$ ) {
        this.$.style.position = 'relative';
        if ( this.orientation == 'vertical' ) {
          this.$.style.width = "100%";
//          this.$.style.overflowY = 'scroll';
        } else {
//          this.$.style.overflowX = 'scroll';
          this.$.style.height = "100%";

        }
      }

      this.count_ = 0;
      //this.data.pipe(this); // TODO: maybe not?
    },

    updatePositions: function() {
      if ( ! this.$ ) return;

      if ( this.$ ) {
        this.$.style.position = 'relative';
        if ( this.orientation == 'vertical' ) {
          this.$.style.width = "100%";
//          this.$.style.overflowY = 'scroll';
        } else {
//          this.$.style.overflowX = 'scroll';
          this.$.style.height = "100%";

        }
      }

      var mySize = ( this.orientation == 'vertical' ) ?  this.$.offsetWidth : this.$.offsetHeight;
      if ( ! mySize ) {
        this.X.setTimeout(this.onPositionUpdate, 30);
        return;
      }

      var rows = [];
      for (var key in this.rowCache_) {
        var d = this.rowCache_[key];
        rows[d.ordering] = d;
      }
      //console.log("updatePositions", rows.length);

      var pos = 0;
      for (var i = 0; i < rows.length; ++i) {
        if ( rows[i] && rows[i].view.$ ) {

          var r = rows[i];
          var v = r.view.$;

          var otherOffset = 0;
          if ( ! r.placed ) {
            otherOffset = -mySize; // hasn't been positioned before, so animate in
          }

          if ( r.offset !== pos ) {
            r.offset = pos;
            if (  this.orientation == 'vertical' ) {
              v.style.transform = v.style.webkitTransform =
                "translate3d("+otherOffset+"px, "+r.offset+"px, 0px)";
            } else {
              v.style.transform = v.style.webkitTransform =
                "translate3d("+r.offset+"px, "+otherOffset+"px, 0px)";
            }
            v.style.display = '';

            //console.log("Position", r.view.id, r.ordering, r.offset);
          }
          // TODO(jacksonic): the size we cache here could change in the DOM, and we have no way of knowing
          if ( ! r.size ) {
            //var rect = v.getBoundingClientRect();
            r.size = ( this.orientation == 'vertical' ) ? v.offsetHeight : v.offsetWidth;
            if ( this.orientation == 'vertical' ) {
              v.style.width = "100%";
            } else {
              v.style.height = "100%";
            }

            //console.log(i, "Set row size:", r.size);
          }
          pos += r.size;

        }
      }

      // force container height
      this.$.style.height = pos;

      // come back and transition in the new views
      this.X.setTimeout(this.finishPositioning, 50);
    },

    daoRemovalCheck: function() {
      // reset ordering
      for (var key in this.rowCache_) {
        this.rowCache_[key].ordering = -1;
      }
      this.removalCheck_ = true;
      // have everything put back in
      this.data.select(this);
    },

    destroy: function(s) {
      this.SUPER(s);

      //this.data && this.data.unlisten(this); // TODO: maybe not?
      //console.log("md.DAOListView clearing cache");
      this.rowCache_ = {};
      if ( this.$ ) this.$.innerHTML = "";
    }

  },

  listeners: [
    {
      name: 'finishPositioning',
      framed: true,
      code: function() {
        var rows = [];
        for (var key in this.rowCache_) {
          var d = this.rowCache_[key];
          rows[d.ordering] = d;
        }
        for (var i = 0; i < rows.length; ++i) {
          var r = rows[i];
          if ( r && r.view.$ && ( ! r.placed ) ) {
            var v = r.view.$;
            r.placed = true;
            v.style.transition = "transform 300ms ease";
            if (  this.orientation == 'vertical' ) {
              v.style.transform = v.style.webkitTransform =
                "translate3d(0px, "+r.offset+"px, 0px)";
            } else {
              v.style.transform = v.style.webkitTransform =
                "translate3d("+r.offset+"px, 0px, 0px)";
            }
            v.style.display = '';
          }
        }
      }
    },
    {
      name: 'onDAOUpdate',
      code: function() {
        this.realDAOUpdate();
      }
    },
    {
      name: 'onPositionUpdate',
      framed: true,
      code: function() {
        this.updatePositions();
      }
    },
    {
      name: 'realDAOUpdate',
      isFramed: true,
      code: function() {
        if ( ! this.isHidden ) {
          this.daoChange();
          this.daoRemovalCheck();
        }
      }
    },
  ]
});
