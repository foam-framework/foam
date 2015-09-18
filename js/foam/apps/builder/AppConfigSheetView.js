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
  extendsModel: 'foam.ui.SimpleView',

  imports: [
    'popup',
  ],

  properties: [
    'data',
    'popup',
    {
      model_: 'ViewFactoryProperty',
      name: 'innerView',
      defaultValue: 'foam.ui.md.DetailView'
    },
    {
      name: '$heading',
      getter: function() {
        return this.$ ? this.$.querySelector('#' + this.id + '-heading') : null;
      },
    },
  ],

  methods: [
    function initHTML() {
      this.SUPER();
      var duration = (this.popup ?
          this.popup.TRANSITION_DURATION : '.3') || '.3';
      this.$heading.style.transition =
          'background-color cubic-bezier(0.4, 0.0, 1, 1) ' + duration + 's' +
          ', color cubic-bezier(0.4, 0.0, 1, 1) ' + duration + 's';
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
        <div id="%%id-heading" class="md-heading md-headline">
          <div class="heading-content">
            <span><%# (this.data ? this.data.appName : 'App') + ' Configuration' %></span>
            <span>$$close</span>
          </div>
        </div>
        <%= this.innerView({
              data$: this.data$,
              extraClassName: 'overflow-vertical',
            }, this.Y) %>
      </app-config>
      <% this.setClass('expanded', function() {
           return ( ! this.popup ) || this.popup.state === 'expanded';
         }.bind(this), this.id);
         this.on('click', function() {
           this.popup && this.popup.expandOrCollapse();
         }.bind(this), this.id + '-heading'); %>
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
        transition:
      }
      app-config.expanded .md-heading {
        color: #fff;
        background-color: #3e50b4;
      }
      app-config .overflow-vertical {
        overflow-x: hidden;
        overflow-y: auto;
      }
    */},
  ],
});
