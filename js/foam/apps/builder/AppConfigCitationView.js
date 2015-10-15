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
  package: 'foam.apps.builder',
  name: 'AppConfigCitationView',
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
      defaultValue: 'md-app-config-citation-view'
    },
    {
      name: 'subtitle'
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class='md-app-config-citation-view-name'>
          <div class='md-app-config-citation-view-inner md-subhead'>
            $$appName{ model_: 'foam.ui.StringElideTextualView' }
          </div>
        </div>
      </div>
    */},
    function CSS() {/*
      .md-app-config-citation-view {
        display: flex;
        align-items: center;
        transition: background-color 300ms ease;
        background-color: transparent;
      }
      .md-app-config-citation-view-name {
        flex-grow: 1;
        width: 0;
      }

      .md-app-config-citation-view-inner {
        display: flex;
        margin: 12px;
      }

      .md-app-config-citation-view .textual-dao-view {
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        overflow: hidden;
        opacity: 0.75;
      }


      .md-app-config-citation-view.dao-selected {
        background-color: #eeeeee;
      }

    */},
  ],

});
