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

  properties: [
    'data',
    {
      model_: 'IntProperty',
      name: 'minHeight',
      units: 'px',
      defaultValue: 400,
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.height = nu;
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'innerView',
      defaultValue: 'foam.ui.md.DetailView'
    },
  ],

  templates: [
    function toHTML() {/*
      <app-config id="%%id" %%cssClassAttr() style="height: {{{this.minHeight}}}px">
        <div class="md-heading md-headline app-config-title">
          <%# (this.data ? this.data.appName : 'App') + ' Configuration' %>
        </div>
        <%= this.innerView({
              data$: this.data$,
              extraClassName: 'overflow-vertical',
            }, this.Y) %>
      </app-config>
    */},
    function CSS() {/*
      app-config {
        display: flex;
        flex-direction: column;
        position: absolute;
        bottom: 0;
        z-index: 2;
        left: 16px;
        background-color: #fff;
        right: 16px;
        box-shadow: 2px 0px 7px rgba(0, 0, 0, 0.48);
      }
      app-config .app-config-title {
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
