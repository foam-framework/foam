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
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.fonts.LigatureTester',
    'foam.ui.ImageView',
    'foam.ui.LigatureView',
  ],

  imports: [
    'document',
  ],

  properties: [
    {
      type: 'String',
      name: 'url',
    },
    {
      type: 'String',
      name: 'ligature',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        // Check that document.createElement exists, as a way of checking if we
        // have a real DOM. LigatureTester doesn't load properly without one.
        if ( nu && this.document.createElement ) {
          this.ligatureTester = this.LigatureTester.create({
            ligature$: this.ligature$,
            expectedWidth$: this.width$,
            expectedHeight$: this.height$,
            ligatureViewFactory: function() {
              return this.LigatureView.create({
                data$: this.ligature$,
                color$: this.color$,
                fontSize$: this.fontSize$,
                className$: this.ligatureClassName$,
              }, this.Y);
            }.bind(this),
          }, this.Y);
        }
      },
    },
    {
      type: 'Int',
      name: 'width',
      defaultValue: 24,
    },
    {
      type: 'Int',
      name: 'height',
      defaultValue: 24,
    },
    {
      model_: 'foam.ui.ColorProperty',
      name: 'color',
      lazyFactory: function() { return 'currentColor'; },
      postSet: function(old, nu) {
        if ( old && old.alpha$ ) Events.unfollow(old.alpha$, this.alpha$);
        if ( nu && nu.alpha$ ) Events.follow(nu.alpha$, this.alpha$);
      },
    },
    {
      type: 'Float',
      name: 'alpha',
      defaultValue: 1.0,
    },
    {
      type: 'Int',
      name: 'fontSize',
      defaultValue: 24,
    },
    {
      type: 'String',
      name: 'imageClassName',
      defaultValue: 'icon',
    },
    {
      type: 'String',
      name: 'imageClassName',
      defaultValue: 'material-icons-extended',
    },
    {
//      type: 'foam.ui.ImageView',
      name: 'imageView',
      lazyFactory: function() {
        return this.ImageView.create({
          data$: this.url$,
          className$: this.imageClassName$,
          alpha$: this.alpha$,
          displayWidth$: this.width$,
          displayHeight$: this.height$,
        }, this.Y);
      },
    },
    {
//      type: 'foam.ui.LigatureView',
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
//      type: 'foam.fonts.LigatureTester',
      name: 'ligatureTester',
      defaultValue: null,
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
        <% if ( this.ligatureView ) { %>
             %%ligatureView
        <% } else { %>
             %%imageView
        <% } %>
      </icon>
    */},
    function CSS() {/*
      icon { display: block; }
    */},
  ],
});
