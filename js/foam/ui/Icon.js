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
  name: 'Icon',
  extendsModel: 'foam.ui.SimpleView',

  requires: [
    'foam.fonts.LigatureTester',
    'foam.ui.ImageView',
    'foam.ui.LigatureView',
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'url',
      defaultValue: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAP0lEQVR4AWMYIBDM8IbhNUMA0eqByv8D4SviNbwGa3hJvIYAhldA5X5U9eZ/wpBcDZgAlyLKNYxqAIJRDXQEAMK/cixwO0GPAAAAAElFTkSuQmCC',
    },
    {
      model_: 'StringProperty',
      name: 'ligature',
      defaultValue: 'accessibility',
    },
    {
      model_: 'IntProperty',
      name: 'width',
      defaultValue: 24,
    },
    {
      model_: 'IntProperty',
      name: 'height',
      defaultValue: 24,
    },
    {
      model_: 'IntProperty',
      name: 'fontSize',
      defaultValue: 24,
    },
    {
      model_: 'StringProperty',
      name: 'imageClassName',
      defaultValue: 'icon',
    },
    {
      model_: 'StringProperty',
      name: 'imageClassName',
      defaultValue: 'material-icons-extended',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'imageView',
      lazyFactory: function() {
        return function() {
          return this.ImageView.create({
            data$: this.url$,
            className$: this.imageClassName$,
          }, this.Y);
        }.bind(this);
      },
    },
    {
      type: 'foam.ui.LigatureView',
      name: 'ligatureView',
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        for ( var i = 0; i < this.children.length; ++i ) {
          this.children[i].destroy();
        }
        this.children = [];

        var out = TemplateOutput.create(nu);
        nu.toHTML(out);
        this.$.innerHTML = out.toString();
        nu.initHTML();

        this.addChild(nu);
      },
    },
    {
      type: 'foam.fonts.LigatureTester',
      name: 'ligatureTester',
      factory: function() {
        return this.LigatureTester.create({
          ligature$: this.ligature$,
          expectedWidth$: this.width$,
          expectedHeight$: this.height$,
          ligatureViewFactory: function() {
            return this.LigatureView.create({
              data$: this.ligature$,
              fontSize$: this.fontSize$,
              className$: this.ligatureClassName$,
            }, this.Y);
          }.bind(this),
        }, this.Y);
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( this.ligatureTester ) this.ligatureTester.ligatureViewFuture(
          function(ligatureView) {
            this.ligatureView = ligatureView;
          }.bind(this));
    },
  ],

  templates: [
    function toHTML() {/*
      <icon id="%%id" %%cssClassAttr()>
        %%imageView()
      </icon>
    */},
    function CSS() {/*
      icon { display: block; }
    */},
  ],
});
