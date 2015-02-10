/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'ActionButton',
  package: 'foam.ui.polymer',

  extendsModel: 'View',

  requires: [
    'foam.ui.polymer.gen.PaperButton'
  ],

  properties: [
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      name: 'className',
      defaultValue: 'button'
    },
    {
      name: 'label',
      defaultValueFn: function() {
        return this.data ?
            this.action.labelFn.call(this.data, this.action) :
            this.action.label;
      }
    },
    {
      name: 'button',
      factory: function() {
        return this.PaperButton.create({
          className: 'polymerActionButton'
        });
      },
      postSet: function(old, nu) {
        if ( old ) {
          old.unsubscribe(['click'], this.onClick);
          Events.unlink(this.label$, old.content$);
        }
        if ( nu ) {
          nu.subscribe(['click'], this.onClick);
          Events.link(this.label$, nu.content$);
        }
      }
    },
    {
      name: 'action'
    },
    {
      name: 'data'
    },
    {
      name: 'showLabel',
      defaultValueFn: function() { return this.action.showLabel; }
    },
    {
      name: 'haloColor'
    },
    {
      name: 'tooltip',
      defaultValueFn: function() { return this.action.help; }
    },
    {
      name: 'speechLabel',
      defaultValueFn: function() { return this.action.speechLabel; }
    },
    {
      name:  'color',
      label: 'Foreground Color',
      type:  'String',
      postSet: function(_, nu) { this.button.color = nu; }
    },
    {
      name:  'font',
      type:  'String',
      postSet: function(_, nu) { this.button.font = nu; }
    },
    'tabIndex',
    'role'
  ],

  listeners: [
    {
      name: 'onClick',
      code: function() {
        if ( ! this.action ) debugger;
        if ( typeof this.action.callIfEnabled !== 'function' ) debugger;
        this.action.callIfEnabled(this.X, this.data);
      }
    }
  ],

  methods: [
    {
      name: 'toInnerHTML',
      code: function() {
        if ( ! this.button ) return '';
        var innerHTML = this.button.toHTML() || '';
        this.addChild(this.button);
        if ( ! this.haloColor ) return innerHTML;
        var style = '<style>' + '#' + this.button.id +
            '::shadow #ripple { color: ' + this.haloColor + '; }</style>';
        return style + innerHTML;
      }
    }
  ],

  templates: [
    {
      name: 'CSS',
      template: function CSS() {/*
        paper-button.polymerActionButton {
          background-color: rgba(0, 0, 0, 0);
          min-width: initial;
          margin: initial;
          flex-grow: 1;
          justify-content: center;
          display: flex;
        }
      */}
    }
  ]
});
