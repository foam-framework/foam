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
  extendsModel: 'foam.ui.SimpleView',

  requires: [
    'foam.graphics.PieGraph'
  ],
  imports: [ 'selection$', 'clock$' ],

  properties: [
    {
      name: 'selection',
      postSet: function() { this.paint(); }
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
    },
    function paint() {
      this.pie.view && this.pie.view.paint && this.pie.view.paint();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        console.log('TPG tick');
        this.groups = {};
        return this.data.select({
          put: function(task) {
            this.groups[task.id] = task[this.property.name];
          }.bind(this)
        })(function() {
          this.pie.groups = this.groups;
          this.paint();
        }.bind(this));
      }
    }
  ],

  templates: [ function toHTML() {/* %%pie */} ]
});
