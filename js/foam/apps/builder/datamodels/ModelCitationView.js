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
  extendsModel: 'foam.ui.DetailView',

  requires: [
    'foam.ui.TextualDAOListView',
    'foam.ui.TextualView',
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
          $$id{ model_: 'foam.ui.md.TextFieldView', mode:'read-only', floatingLabel: false }
          $$properties{ model_: 'foam.ui.TextualDAOListView', rowView: 'foam.ui.TextualView' }
        </div>
        <div class='md-style-trait-standard'>
          $$preview{ color: 'black' }
        </div>
      </div>
    */},
    function CSS() {/*
      .md-model-citation-view {
        display: flex;
        align-items: center;
      }
      .md-model-citation-view-name {
        flex-grow: 1;
      }
      .md-model-citation-view .textual-dao-view {
        text-overflow: ellipsis;  
        white-space: nowrap;
        width: 100%;
        overflow: hidden;
        margin: 16px;
        opacity: 0.75;
      }
      
      
      .md-model-citation-view.dao-selected {
        background: #eeeeee;
      }

    */},
  ],

});
