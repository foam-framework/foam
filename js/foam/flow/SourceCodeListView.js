/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.flow',
  name: 'SourceCodeListView',
  extends: 'foam.ui.View',

  traits: [
    'foam.ui.DAODataViewTrait'
  ],

  requires: [
    'foam.flow.CodeView'
  ],

  properties: [
    {
      name: 'tagName',
      defaultValue: 'sources'
    },
    {
      // TODO(markdittmer): Should be able to use foam.ui.ModeProperty here
      // but it doesn't seem to be working. It should eliminate the need for
      // a postSet.
      type: 'String',
      name: 'mode',
      defaultValue: 'read-write'
    },
    {
      type: 'ViewFactory',
      name: 'rowView',
      defaultValue: 'foam.flow.CodeView'
    },
    {
      type: 'Array',
      name: 'openViews',
      lazyFactory: function() { return [-2, -1]; }
    }
  ],

  methods: [
    {
      name: 'construct',
      code: function() {
        this.SUPER.apply(this, arguments);
        if ( ! this.$ ) return;

        var html = [], children = this.children,
            len = children.length;
        var i, child;
        for ( i = 0; i < len; ++i ) {
          child = children[i];
          html.push(child.toHTML());
          if ( this.mode === 'read-only' ||
              (this.openViews.indexOf(i) < 0 &&
              this.openViews.indexOf(i - len) < 0) ) {
            child.mode = 'read-only';
          } else {
            child.mode = 'read-write';
          }
        }

        this.$.innerHTML = html.join('');

        for ( i = 0; i < len; ++i ) {
          children[i].initHTML();
        }
      }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;

        var self = this, children = [];
        self.dao.select({
          put: function(o) {
            var child = self.rowView({ data: o, model: o.model_}, self.Y);
            children.push(child);
          }
        })(function() { self.children = children; self.construct(); });
      }
    }
  ],

  templates: [
    function CSS() {/*
      sources {
        display:block;
      }
    */}
  ]
});
