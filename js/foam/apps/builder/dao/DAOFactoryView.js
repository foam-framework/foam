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
  package: 'foam.apps.builder.dao',
  name: 'DAOFactoryView',
  extends: 'foam.apps.builder.dao.EditView',

  requires: [
    'foam.ui.StringElideTextualView',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'dao-factory-view',
    },
    {
      name: 'myModelName',
      defaultValueFn: function() { return this.data && this.data.model_.label; },
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="dao-factory-container">
          <div class="dao-factory-title md-subhead">
            $$label{ model_: 'foam.ui.StringElideTextualView' }
          </div>
          <div class="dao-factory-description">
            $$myModelName{ model_: 'foam.ui.StringElideTextualView' }
          </div>
        </div>
      </div>
    */},
    function CSS() {/*
      .dao-factory-view {
        display: flex;
      }
      .dao-factory-view .dao-factory-container {
        flex-grow: 1;
        width: 0;
      }
      .dao-factory-view .dao-factory-description {
        opacity: 0.75;
        display: flex;
        margin: 12px;
      }
      .dao-factory-view .dao-factory-title {
        display: flex;
        margin: 12px;
      }

      .dao-factory-view.dao-selected {
        background: #eeeeee;
      }
    */},
  ],

});
