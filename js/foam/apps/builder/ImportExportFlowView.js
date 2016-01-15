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
  name: 'ImportExportFlowView',
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.apps.builder.StateView',
    'foam.ui.md.FlatButton',
  ],
  imports: [
    'popup',
    'window',
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) Events.unfollow(old.state$, this.stateView.data$);
        if ( nu ) Events.follow(nu.state$, this.stateView.data$);
      },
    },
    {
      type: 'Boolean',
      name: 'showHeader',
      documentation: 'If true, header content is shown.',
      defaultValue: true,
    },
    {
      type: 'Boolean',
      name: 'showFooter',
      documentation: 'If true, footer actions are shown.',
      defaultValue: true,
    },
    {
      name: 'stateView',
      lazyFactory: function() {
        var view = this.StateView.create({}, this.Y);
        if ( this.data ) Events.follow(this.data.state$, view.data$);
        return view;
      },
    },
  ],

  actions: [
    {
      name: 'openDevDashboard',
      label: 'Open Developer Dashboard',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAMElEQVRIx2NgGAWkAKfWL//xYVLVjVowagEJGqmdTEdwPhhyQTma0UYtGMB8MLIAACgDuh9v+XUsAAAAAElFTkSuQmCC',
      ligature: 'dashboard',
      isAvailable: function() {
        return this.data &&
            (this.data.state === 'FAILED' || this.data.state === 'COMPLETED') &&
            (this.data.actionName === 'uploadApp' ||
            this.data.actionName === 'publishApp');
      },
      code: function() {
        this.window.open('https://chrome.google.com/webstore/developer/dashboard');
        this.popup.close();
      },
    },
    {
      name: 'close',
      label: 'Return to App Builder',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAKlBMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfQ4qnXoAAAADXRSTlMALb0VFr4r09XS1Cwq3rqZUAAAAFpJREFUeNrFkEEKwDAIBG3Upk3r/79bD4sseOgxe5wBGZT9O4YKZn6S8JgKfsUgoTMN+K3CZsXSzmGsOM/SdI7zxf8FetDWuKK6cVQ3XtUkPHlVO4mHn/jK9n3dyANYyKnIcwAAAABJRU5ErkJggg==',
      ligature: 'close',
      isAvailable: function() {
        return this.data &&
            (this.data.state === 'FAILED' || this.data.state === 'COMPLETED');
      },
      code: function() { this.popup.close(); },
    },
  ],

  templates: [
    function toHTML() {/*
      <export-flow id="%%id">
        <div id="%%id-header">
          <div class="md-card-heading">
            <span class="md-headline">{{this.data.title}}</span>
          </div>
          <div class="md-card-heading-content-spacer"></div>
        </div>
        <div class="md-card-content">
          %%stateView
          <span id="%%id-message" class="md-subhead md-grey"><%# this.data.message %></span>
          <details class="md-subhead md-grey"><%# this.data.details %></details>
        </div>
        <div id="%%id-footer">
          <div class="md-card-content-footer-spacer"></div>
          <actions class="md-actions md-card-footer vertical">
            $$openDevDashboard{
              model_: 'foam.ui.md.FlatButton',
              displayMode: 'LABEL_ONLY',
            }
            $$close{
              model_: 'foam.ui.md.FlatButton',
              displayMode: 'LABEL_ONLY',
            }
          </actions>
        </div>
      </export-flow>
      <% this.setClass('hidden', function() {
           return ( ! this.data ) || ( ! this.data.message );
         }.bind(this), this.id + '-message');
         this.setClass('hidden', function() {
           return ! this.showHeader;
         }.bind(this), this.id + '-header');
         this.setClass('hidden', function() {
           return ! this.showFooter;
         }.bind(this), this.id + '-footer'); %>
    */},
    function CSS() {/*
      @media (min-width: 600px) {
        export-flow {
          min-width: 570px;
        }
      }
      export-flow { flex-grow: 1; }
      export-flow, export-flow actions {
        display: flex;
      }
      export-flow {
        flex-direction: column;
      }
      export-flow .hidden { display: none; }
    */},
  ],
});
