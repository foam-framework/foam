/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
CLASS({
  package: 'foam.u2',
  name: 'Icon',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.Ligature',
    'foam.u2.tag.Image',
  ],

  documentation: 'A fairly thin wrapper around Ligature and Image. ' +
      'When the ligature is provided, it will use the ligature (even if the ' +
      'icon font is not loaded, or the ligature name is not recognized). ' +
      'The icon URL is used if no ligature is given.',

  properties: [
    ['nodeName', 'icon'],
    {
      type: 'String',
      name: 'url',
    },
    {
      type: 'String',
      name: 'ligature',
    },
    {
      type: 'Int',
      name: 'width',
      defaultValue: 24,
    },
    {
      type: 'Int',
      name: 'width',
      defaultValue: 24,
    },
    {
      model_: 'foam.ui.ColorProperty',
      name: 'color',
      lazyFactory: function() { return 'currentColor'; },
      postSet: function(old, nu) {
        if ( old && old.alpha$ ) Events.unfollow(old.alpha$, this.alpha$);
        if ( nu && nu.alpha$ ) Events.follow(nu.alpha$, nu.alpha$);
      },
    },
    {
      type: 'Float',
      name: 'alpha',
      defaultValue: 1.0
    },
    {
      type: 'Int',
      name: 'fontSize',
      defaultValue: 24,
    },
  ],

  methods: [
    function initE() {
      this.cls(this.myCls());
      if ( this.ligature ) {
        this.add(this.Ligature.create({ data$: this.ligature$ }));
      } else {
        this.add(this.Image.create({
          data$: this.url$,
          alpha$: this.alpha$,
          displayWidth$: this.width$,
          displayHeight$: this.height$,
        }));
      }
    },
  ],

  templates: [
    function CSS() {/*
      icon {
        display: block;
      }
    */},
  ]
});
