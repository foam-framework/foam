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
  name: 'ChoiceListView',
  package: 'foam.ui.md',
  extendsModel: 'foam.ui.ChoiceListView',

  requires: [ 'foam.ui.md.Flare' ],

  properties: [
    {
      name: 'autoSetData',
      defaultValue: false
    },
    {
      name: 'extraClassName',
      defaultValue: 'mdChoiceListView'
    },
    {
      name: 'flareFactory',
      factory: function() {
        return this.Flare.xbind({
          color: 'rgb(255,255,255)',
          startAlpha: 0.2,
          cssPosition: 'absolute',
          startX: 0.5,
          startY: 0.5,
          growTime: 250,
          fadeTime: 250
        });
      }
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        for ( var i = 0; i < this.choices.length; ++i ) {
          var choice = this.choices[i];
          choice.flare = this.Flare.create({
            element: this.X.$(choice.htmlId),
            color: 'rgb(255,255,255)',
            startAlpha: 0.2,
            cssPosition: 'absolute',
            startX: 0.5,
            startY: 0.5,
            growTime: 250,
            fadeTime: 250
          });
          this.on(
              'click',
              function(index, e) {
                var flare = this.choices[index].flare,
                    choice = this.choice = this.choices[index],
                    element = this.X.$(choice.htmlId),
                    pointMap = e.pointMap,
                    x = element.offsetLeft,
                    y = element.offsetTop,
                    w = element.offsetWidth,
                    h = element.offsetHeight,
                    startX = 0.5,
                    startY = 0.5;
                Object_forEach(e.pointMap, function(p) {
                  if ( p.x >= x && p.x <= x + w &&
                      p.y >= y && p.y <= y + h ) {
                    startX = (p.x - x) / w;
                    startY = (p.y - y) / h;
                  }
                });
                flare.startX = startX;
                flare.startY = startY;
                flare.fire();
              }.bind(this, i),
              choice.htmlId);
        }
      }
    },
    {
      name: 'toInnerHTML',
      code: function() {
        var out = [];
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          var choice = this.choices[i];
          var id     = choice.htmlId = choice.htmlId || this.nextID();
          out.push(this.choiceToHTML(id, choice));
        }
        return out.join('');
      }
    }
  ],

  templates: [
    function CSS() {/*
      .mdChoiceListView.horizontal > li.choice {
        position: relative;
        overflow: hidden;
        display: inline-block;
        line-height: 1.25em;
        border-radius: 2px 2px 0px 0px;
      }
      .mdChoiceListView.horizontal > li.selected {
        line-height: 1.0em;
        border-bottom: 2px solid #ffffff;
      }
    */}
  ]
});
