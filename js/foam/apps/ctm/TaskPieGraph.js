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
  package: 'foam.apps.ctm',
  name: 'TaskPieGraph',
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.graphics.PieGraph'
  ],
  imports: [
    'hardSelection$',
    'softSelection$',
    'clock$'
  ],

  properties: [
    {
      name: 'hardSelection',
      postSet: function() { this.paint(); }
    },
    {
      name: 'softSelection',
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
      // type: 'foam.graphics.PieGraph',
      name: 'pie',
      lazyFactory: function() {
        return this.PieGraph.create({
          width: 100,
          height: 100,
          toColor: function(id, i, n) {
            if ( this.hardSelection && this.hardSelection.id == id ) {
              return 'rgb(72,131,239)';
            } else if ( this.softSelection && this.softSelection.id == id ) {
              return 'rgb(232,240,253)';
            } else {
              return 'lightgray';
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
    function initHTML() {
      this.SUPER();
      this.tick();
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
