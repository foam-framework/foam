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
  name: 'BuilderView',
  extends: 'foam.ui.View',

  requires: [
    'foam.browser.ui.BrowserView',
    'foam.ui.FutureView',
  ],
  imports: [
    'setTimeout'
  ],
  exports: [
    'appSelection as selection',
    'appSelection',
  ],

  properties: [
    'appSelection',
    {
      type: 'ViewFactory',
      name: 'menuSelectionFuture',
      documentation: function() {/*
        Create a FutureView for a BrowserView. Resolve future and unhook
        listener when $$DOC{ref:'.data.menuSelection'} is set. If not data
        arrives within 10 seconds, then just clean up the listener.
      */},
      defaultValue: function() {
        var future = afuture();
        var done = false;
        var prop = this.data.menuSelection$;
        var f = function(_, __, ___, nu) {
          if ( ! done ) {
            if ( nu ) future.set(nu);
            prop.removeListener(f);
          }
          done = true;
        }.bind(this);
        prop.addListener(f);
        this.setTimeout(f, 10000);
        return this.FutureView.create({
          future: future.get,
          innerView: this.BrowserView,
        }, this.Y);
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <builder id="%%id" <%= this.cssClassAttr() %>>
        <% if ( this.data.menuSelection ) { %>
          $$menuSelection
        <% } else { %>
          %%menuSelectionFuture()
        <% } %>
      </builder>
    */},
    function CSS() {/*
      builder { display: block; }
      builder .md-update-detail-view-body {
        display: flex;
        flex-grow: 1;
        overflow: hidden;
      }
    */},
  ],
});
