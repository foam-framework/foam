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
  name: 'TaskPieGraph',
  package: 'foam.apps.ctm',
  extendsModel: 'foam.ui.AbstractDAOView',

  requires: [
    'foam.graphics.PieGraph'
  ],
  imports: [ 'selection$', 'clock$' ],

  properties: [
    {
      name: 'selection',
      postSet: function() { this.pie.paintSelf(); }
    },
    {
      name: 'property',
      required: true
    },
    {
      name: 'groups'
    },
    {
      type: 'foam.graphics.PieGraph',
      name: 'pie',
      lazyFactory: function() {
        return this.PieGraph.create({
          width: 100,
          height: 100,
          toColor: function(id, i, n) {
            if ( this.selection ) {
              if ( this.selection.id == id ) return 'red';
              else                            return 'lightgray';
            } else {
              return this.pie.toHSLColor(i, n);
            }
          }.bind(this)
        }, this.Y);
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.clock$.addListener(this.tick);
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: 200,
      code: function() {
        this.groups = {};
        return this.dao.select({
          put: function(task) {
            this.groups[task.id] = task[this.property.name];
          }.bind(this),
          error: function() {
            // TODO(markdittmer): Handle errors.
          },
          eof: function() {
            this.pie.groups = this.groups;
            this.pie.paintSelf();
          }.bind(this)
        });
      }
    }
  ],

  templates: [ function toHTML() {/* %%pie */} ]
});
