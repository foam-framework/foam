/*
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  "package": "foam.ui.layout",
  "name": "ViewSlider",
  extends: "foam.ui.View",
  "traits": [
    "foam.ui.layout.PositionedDOMViewTrait"
  ],
  "properties": [
    {
      "name": "view"
    },
    {
      "name": "incomingView"
    },
    {
      model_: "foam.core.types.StringEnumProperty",
      "name": "direction",
      "defaultValue": "horizontal",
      "choices": [
        [
          "horizontal",
          "horizontal"
        ],
        [
          "vertical",
          "vertical"
        ]
      ]
    },
    {
      type: 'Boolean',
      "name": "reverse",
      "defaultValue": false
    },
    {
      type: 'Float',
      "name": "slideAmount",
      "defaultValue": 0
    },
    {
      "name": "latch"
    }
  ],
  "methods": [
    {
      model_: "Method",
      "name": "init",
      "code": function () {
        this.SUPER();
        var self = this;
        this.X.dynamicFn(
            function() {
              self.width;
              self.height;
              self.direction;
              self.slideAmount;
              self.reverse;
            },
            this.layout);
      }
    },
    {
      model_: "Method",
      "name": "toHTML",
      "code": function () {
        this.children = [];
        return this.SUPER();
      }
    },
    {
      model_: "Method",
      "name": "initHTML",
      "code": function () {
        this.layout();
        this.SUPER();
      }
    },
    {
      model_: "Method",
      "name": "setView",
      "code": function (view) {
        if ( this.view ) {
          this.view.destroy();
          if ( this.$ ) this.$.removeChild(this.view.$);
        }
        this.view = view;
        this.layout();
        if ( this.$ ) {
          this.$.insertAdjacentHTML('beforeend', view.toHTML());
          view.initHTML();
        }
      },
      "args": []
    },
    {
      model_: "Method",
      "name": "slideView",
      "code": function (view, opt_interp, opt_time, opt_delay) {
        if ( ! this.$ ) return;

        if ( this.latch ) {
          this.latch();
          this.latch = '';
        }

        this.incomingView = view;
        this.layout();
        view.destroy();
        this.$.insertAdjacentHTML('beforeend', view.toHTML());
        view.initHTML();

        opt_interp = opt_interp || Movement.easeOut(1);
        opt_time = opt_time || 300;

        var self = this;

        var fn = function() { self.slideAmount = 1.0; };

        window.setTimeout(function() {
          self.latch = this.X.animate(opt_time, fn, opt_interp, function() {
            if ( self.view ) {
              self.$.removeChild(self.view.$);
              self.view.destroy();
            }
            self.view = view;
            self.incomingView = '';
            self.latch = '';
            self.slideAmount = 0;
          })();
        }, opt_delay || 0);
      },
      "args": []
    }
  ],
  "listeners": [
    {
      model_: "Method",
      "name": "layout",
      "code": function () {
        this.view.width = this.width;
        this.view.height = this.height;

        if ( this.incomingView ) {
          this.incomingView.width = this.width;
          this.incomingView.height = this.height;
        }

        var r = 1;
        if ( this.reverse ) r = -1;

        if ( this.direction === 'horizontal' ) {
          this.view.x = -(r * this.slideAmount * this.width);
          this.view.y = 0;
          if ( this.incomingView ) {
            this.incomingView.x = r * this.width - (r * this.slideAmount * this.width);
            this.incomingView.y = 0;
          }
        } else {
          this.view.x = 0;
          this.view.y = -(r * this.slideAmount * this.height);
          if ( this.incomingView ) {
            this.incomingView.x = 0;
            this.incomingView.y = r * this.height - (r * this.slideAmount * this.height);
          }
        }
      },
      "args": []
    }
  ],
  "templates": [
    {
      model_: "Template",
      "name": "toInnerHTML",
      "args": [],
      "template": " <%= this.view %> "
    }
  ]
});
