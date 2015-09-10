
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
  package: 'foam.ui',
  name: 'LigatureView',
  extendsModel: 'foam.ui.SimpleView',

  properties: [
    {
      model_: 'StringProperty',
      name: 'data',
      defaultValue: 'accessibility',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.textContent = nu;
      },
    },
    {
      model_: 'StringProperty',
      name: 'tagName',
      defaultValue: 'i',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        var out = TemplateOutput.create(this);
        this.toHTML(out);
        this.$.outerHTML = out.toString();
      },
    },
    {
      model_: 'StringProperty',
      name: 'className',
      defaultValue: 'material-icons-extended',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.className = this.className +
            (this.extraClassName ? ' ' + this.extraClassName : '');
      },
    },
    {
      model_: 'StringProperty',
      name: 'extraClassName',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.className = this.className +
            (this.extraClassName ? ' ' + this.extraClassName : '');
      },
    },
    {
      model_: 'IntProperty',
      name: 'width',
      getter: function() { return this.$ ? this.$.scrollWidth : 0; },
    },
    {
      model_: 'IntProperty',
      name: 'height',
      getter: function() { return this.$ ? this.$.scrollHeight : 0; },
    },
    {
      model_: 'IntProperty',
      name: 'fontSize',
      defaultValue: 24,
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style['font-size'] = nu + 'px';
      },
    },
    {
      name: 'color',
      defaultValue: 'currentColor',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style['color'] = nu;
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <{{this.tagName}} id="%%id" %%cssClassAttr()
                        style="font-size: {{this.fontSize}}px; color: %%color">%%data</%%tagName>
    */},
  ]
});
