/**
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
  name: 'PaperButton',
  package: 'foam.ui.polymer.gen',
  extends: 'foam.ui.polymer.gen.View',
  traits: [
    'foam.ui.polymer.gen.PaperButtonBase'
  ],
  constants: {
    POLYMER_PROPERTIES: [
      'raised',
      'recenteringTouch',
      'fill',
      'role'
    ],
    CSS_PROPERTIES: [
      'color',
      'font'
    ]
  },
  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'children',
      hidden: true
    },
    {
      name: 'shortcuts',
      hidden: true
    },
    {
      name: 'className',
      hidden: true
    },
    {
      name: 'extraClassName',
      hidden: true
    },
    {
      name: 'showActions',
      hidden: true
    },
    {
      name: 'initializers_',
      hidden: true
    },
    {
      name: 'destructors_',
      hidden: true
    },
    {
      name: 'tooltip',
      hidden: true
    },
    {
      name: 'tooltipModel',
      hidden: true
    },
    {
      name: 'tagName',
      type: 'String',
      defaultValue: 'paper-button'
    },
    {
      name: 'raised',
      postSet: function(old, nu) { this.postSet('raised', old, nu); }
    },
    {
      name: 'recenteringTouch',
      postSet: function(old, nu) { this.postSet('recenteringTouch', old, nu); }
    },
    {
      name: 'fill',
      postSet: function(old, nu) {
        this.postSet('fill', old, nu);
      }
    },
    {
      name: 'role',
      postSet: function(old, nu) { this.postSet('role', old, nu); },
      defaultValue: 'button'
    },
    {
      name: 'rippleInitialOpacity',
      defaultValue: 0.4
    },
    {
      name:  'color',
      label: 'Foreground Color',
      type:  'String',
      defaultValue: 'black',
      postSet: function() { this.updateStyleCSS(); }
    },
    {
      name:  'font',
      type:  'String',
      defaultValue: '',
      postSet: function() { this.updateStyleCSS(); }
    },
    {
      type: 'Function',
      name: 'polymerDownAction_',
      defaultValue: anop
    }
  ],

  listeners: [
    {
      name: 'polymerDownAction',
      code: function() {
        if ( ! this.$ ) return;
        this.polymerDownAction_.apply(this.$, arguments);
        this.$.$.ripple.initialOpacity = this.rippleInitialOpacity;
      }
    }
  ],


  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();
      }
    },
    {
      name: 'bindDownAction',
      code: function() {
        if ( this.$ && this.$.downAction !== this.polymerDownAction ) {
          this.polymerDownAction_ = this.$.downAction;
          this.$.downAction = this.polymerDownAction;
        }
      }
    },
    {
      name: 'initHTML',
      code: function() {
        var self = this;
        this.on(
            'click',
            function(gesture) { self.publish(['click'], gesture); },
            this.id);
        var rtn = this.SUPER();
        this.bindDownAction();
        this.updateStyleCSS();
        return rtn;
      }
    },
    {
      name: 'destroy',
      code: function() {
        var rtn = this.SUPER();
        console.log('paper-button.destroy', this.id);
        return rtn;
      }
    },
    {
      name: 'updateStyleCSS',
      code: function() {
        if ( ! this.$ ) return;
        var self = this;
        this.CSS_PROPERTIES.forEach(function(propName) {
          self.$.style[propName] = self[propName];
        });
      }
    }
  ]
});
