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
  package: 'foam.apps.builder.datamodels',
  name: 'ModelCitationView',
  extends: 'foam.ui.DetailView',

  requires: [
    'foam.ui.TextualDAOListView',
    'foam.ui.TextualView',
    'foam.ui.StringElideTextualView',
  ],

  imports: [
    'stack',
    'editView',
    'innerEditView',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'md-model-citation-view'
    },
    {
      name: 'subtitle'
    },
    {
      name: 'data',
      postSet: function() {
        var names = [];
        this.data.properties.forEach(function(p) {
          names.push(p.name);
        }.bind(this));
        this.subtitle = names.join(', ');
      }
    },
  ],

  actions: [
    {
      name: 'preview',
      label: 'Preview',
      isAvailable: function() { return !! this.editView; },
      ligature: 'visibility',
      code: function() {
        this.stack.pushView(this.editView({
          data: this.data,
          innerView: this.innerEditView
        }, this.Y));
      }
    },
  ],

  methods: [
    function init() {
      this.Y.set('selection$', null);
      this.SUPER();
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class='md-model-citation-view-name'>
          <div class='md-model-citation-view-inner md-subhead'>
            $$label{ model_: 'foam.ui.StringElideTextualView' }
          </div>
          <div class='md-model-citation-view-inner'>
            $$properties{ model_: 'foam.ui.TextualDAOListView', rowView: 'foam.ui.TextualView' }
          </div>
        </div>
        $$preview{ color: 'black' }
      </div>
    */},
    function CSS() {/*
      .md-model-citation-view {
        display: flex;
        align-items: center;
        transition: background-color 300ms ease;
        background-color: transparent;
      }
      .md-model-citation-view-name {
        flex-grow: 1;
        width: 0;
      }

      .md-model-citation-view-inner {
        display: flex;
        margin: 12px;
      }

      .md-model-citation-view .textual-dao-view {
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        overflow: hidden;
        opacity: 0.75;
      }


      .md-model-citation-view.dao-selected {
        background-color: #eeeeee;
      }

    */},
  ],

});
