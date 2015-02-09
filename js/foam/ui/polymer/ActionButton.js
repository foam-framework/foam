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

  constants: [
    {
      name: 'CSS_PROPERTIES',
      value: [
        'color',
        'font'
      ]
    }
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
      },
      postSet: function(_, nu) { this.render(); }
    },
    {
      name: 'button',
      factory: function() {
        return this.PaperButton.create({
          className: 'polymerActionButton'
        });
      },
      postSet: function(old, nu) {
        if ( old ) Events.unlink(this.label$, old.content$);
        if ( nu ) Events.link(this.label$, nu.content$);
        this.render();
      }
    },
    {
      name: 'action',
      postSet: function(old, nu) {
        old && old.removeListener(this.render);
        nu.addListener(this.render);
      },
      postSet: function(_, nu) { this.render(); }
    },
    {
      name:  'font',
      type:  'String',
      defaultValue: '',
      postSet: function(_, nu) { this.updateStyleCSS(); }
    },
    {
      name: 'data',
      postSet: function(_, nu) { this.render(); }
    },
    {
      name: 'showLabel',
      defaultValueFn: function() { return this.action.showLabel; }
    },
    {
      name: 'haloColor'
    },
    {
      name:  'color',
      label: 'Foreground Color',
      type:  'String',
      defaultValue: 'black',
      postSet: function(_, nu) { this.updateStyleCSS(); }
    },
    {
      name: 'tooltip',
      defaultValueFn: function() { return this.action.help; }
    },
    {
      name: 'speechLabel',
      defaultValueFn: function() { return this.action.speechLabel; }
    },
    'tabIndex',
    'role'
  ],

  listeners: [
    {
      name: 'render',
      isFramed: true,
      code: function() { this.updateHTML(); }
    }
  ],

  methods: [
    {
      name: 'updateStyleCSS',
      code: function() {
        if ( this.button && this.button.$ ) {
          var e = this.button.$;
          var style = e.style;
          this.CSS_PROPERTIES.forEach(function(key) {
            style[key] = this[key];
          }.bind(this));
          this.button.updateHTML();
        }
      }
    },
    {
      name: 'updateHTML',
      code: function() {
        var rtn = this.SUPER();
        this.updateStyleCSS();
        return rtn;
      }
    },
    {
      name: 'initHTML',
      code: function() {
        this.SUPER();

        var self = this;
        var button = this.button;

        // TODO(markdittmer): We should use this.on('click', ...) here, but the
        // gesture manager seems to be broken. Really, we want to attach this
        // to the button (but that too isn't working; perhaps it is Polymer's
        // fault, or perhaps it's gesture manager).
        this.$.addEventListener('click', function() {
          self.action.callIfEnabled(self.X, self.data);
        });

        button.setAttribute('disabled', function() {
          self.closeTooltip();
          return self.action.isEnabled.call(self.data, self.action) ? undefined : 'disabled';
        }, button.id);

        button.setClass('available', function() {
          self.closeTooltip();
          return self.action.isAvailable.call(self.data, self.action);
        }, button.id);

        // this.X.dynamic(function() { self.action.labelFn.call(self.data, self.action); self.updateHTML(); });
      }
    },
    {
      name: 'toInnerHTML',
      code: function() {
        if ( ! this.button ) return '';
        var innerHTML = this.button.toHTML() || '';
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
