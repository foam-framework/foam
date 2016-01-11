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
  name: 'AppConfigSheetView',
  extends: 'foam.ui.SimpleView',

  imports: [
    'popup',
  ],

  properties: [
    'data',
    {
      name: 'popup',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$style ) return;
        this.$style.outerHTML = this.styleHTML();
      },
    },
    {
      type: 'ViewFactory',
      name: 'innerView',
      defaultValue: 'foam.ui.md.DetailView'
    },
    {
      name: '$style',
      getter: function() {
        return this.$ ? this.$.querySelector('#' + this.id + '-style') : null;
      },
    },
  ],

  actions: [
    {
      name: 'close',
      ligature: 'close',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAa0lEQVR4AeWSsREDIQwEtwlRhO3vP0JFPLgeHJDdnEfBh2y8F2hHnM5FJ1AayRtLshiE6F8WHUsw9kT0m8BDMFlMotZ10rzuaHtS63qo6s8HWkaLFXpo5ErXyKWukS25dRM5sXz+Pt+Ls/kBnolC6l7shJkAAAAASUVORK5CYII=',
      isAvailable: function() { return this.popup; },
      code: function() {
        this.popup && this.popup.close();
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <app-config id="%%id" %%cssClassAttr()>
        <% this.styleHTML(out); %>
        <div id="%%id-heading" class="md-heading md-headline app-config-heading">
          <div class="heading-content">
            <span><%# (this.data ? this.data.appName : 'App') + ' Configuration' %></span>
            <span>$$close</span>
          </div>
        </div>
        <%= this.innerView({
              data$: this.data$,
            }, this.Y) %>
      </app-config>
      <% this.setClass('expanded', function() {
           return ( ! this.popup ) ||
               this.popup.state === 'expanding' ||
               this.popup.state === 'expanded';
         }.bind(this), this.id);
         this.on('click', function() {
           this.popup && this.popup.expandOrCollapse();
         }.bind(this), this.id + '-heading'); %>
    */},
    function styleHTML() {/*
      <style id="%%id-style">
        <% if ( this.popup ) {
             var duration = (this.popup ?
                 this.popup.TRANSITION_DURATION : '.3') || '.3'; %>
        .app-config-heading, .swipeAltHeader {
          transition: background-color cubic-bezier(0.4, 0.0, 1, 1) {{{duration}}}s,
                      color cubic-bezier(0.4, 0.0, 1, 1) {{{duration}}}s;
        }
        .swipeAltHeader .choice {
          transition: border-color cubic-bezier(0.4, 0.0, 1, 1) {{{duration}}}s;
        }
        <% } %>
      </style>
    */},
    function CSS() {/*
      app-config {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        z-index: 2;
        background-color: #fff;
        box-shadow: 2px 0px 7px rgba(0, 0, 0, 0.48);
      }
      app-config .heading-content {
        flex-grow: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      app-config .md-heading {
        display: flex;
        background-color: transparent;
      }
      app-config.expanded .md-heading {
        color: #fff;
        background-color: #3e50b4;
      }


      app-config .swipeAltHeader {
        padding-left: 3px !important;
        height: 36px;
      }
      app-config .swipeAltHeader li {
        font-size: 14px;
        line-height: 46px;
        padding-bottom: 14px;
      }
      app-config .swipeAltHeader .choice {
        border-bottom-color: transparent;
      }
      app-config .swipeAltHeader .choice.selected {
        border-bottom: 2px solid rgba(0,0,0,.87);
        font-weight: 500;
      }
      app-config.expanded .swipeAltHeader .choice.selected {
        border-bottom: 2px solid #ff3f80;
      }
      app-config .swipeAltHeader {
        background-color: transparent;
        box-shadow: 0 1px 1px rgba(0,0,0,.25);
        height: 47px;
        margin: 0;
        overflow: hidden;
        padding: 0 0 0 56px;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: -moz-none;
        -o-user-select: none;
        user-select: none;
      }
      app-config.expanded .swipeAltHeader {
        color: #fff;
        background-color: #3e50b4;
      }
      app-config .foamChoiceListView.horizontal .choice {
        text-transform: uppercase;
        padding: 14px 16px;
        margin: 0;
      }
    */},
  ],
});
