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
  package: 'foam.chrome',
  name: 'AppControllerView',
  extends: 'foam.ui.View',

  requires: [
    'CView',
    'foam.ui.DetailView',
    'foam.ui.View'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.ctx$.removeListener(this.onCtxChange);
        if ( nu ) nu.ctx$.addListener(this.onCtxChange);
      }
    },
    {
      type: 'Int',
      name: 'loadCount_',
      defaultValue: 0
    }
  ],

  methods: [
    function initHTML() {
      if ( ! this.data || ! this.data.ctx ) return;
      var ctx = this.data.ctx;
      var noop = function(ret) { ret && ret(undefined); };
      apar(ctx.model ? arequire(ctx.model) : noop,
           ctx.view ? arequire(ctx.view) : noop)(
               this.initHTML_.bind(this, ++this.loadCount_));
    },
    function initHTML_(id, m, v) {
      if ( this.loadCount_ !== id || ! this.$ ) return;
      var app = this.$.querySelector('app');
      var obj, view, viewParams, content;
      if ( ! m ) {
        content = 'Unable to load model';
      } else {
        obj = m.create({}, this.Y);
        viewParams = {
          data: obj,
          model: obj.model_
        };
        if ( v ) {
          view = v.create(viewParams, this.Y);
        } else if ( this.View.isInstance(obj) ) {
          view = obj;
        } else if ( obj.toView_ ) {
          view = obj.toView_();
        } else {
          view = this.DetailView.create(viewParams, this.Y);
        }
        content = view.toHTML();
      }
      app.innerHTML = content;
      if ( view ) view.initHTML();
    }
  ],

  listeners: [
    {
      name: 'onCtxChange',
      code: function(data, _, old, nu) {
        if ( old === nu ) return;
        if ( old ) old.removeListener(this.onCtxDataChange);
        if ( nu ) {
          nu.addListener(this.onCtxDataChange);
          this.onCtxDataChange();
        }
      }
    },
    {
      name: 'onCtxDataChange',
      code: function() { this.initHTML(); }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id">
        $$ctx
        <app></app>
      </div>
    */}
  ]
});
