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
  name: 'Tooltip',
  package: 'foam.ui.polymer',

  extends: 'foam.ui.polymer.View',
  imports: ['document'],

  todo: function() {/*
    (markdittmer): We should probably inherit from Tooltip and implement
    open/close/destroy, but Polymer tooltips prefer to animate themselves.
  */},

  properties: [
    {
      type: 'String',
      name: 'text',
      help: 'Help text to be shown in tooltip.',
      postSet: function() {
        this.updateContents();
      }
    },
    {
      type: 'String',
      name: 'html',
      help: 'Rich (HTML) help contents. Overrides "text" property.',
      postSet: function() { this.updateContents(); }
    },
    {
      name: 'target',
      help: 'Target element to provide tooltip for.',
      postSet: function(_, next) { this.attach(next); }
    },
    {
      type: 'String',
      name: 'tagName',
      defaultValue: 'core-tooltip'
    },
    {
      name: 'tooltip',
      documentation: function() {/*
        HTML element encapsulating the tooltip'd content and the tooltip.
      */},
      postSet: function(prev, next) { this.detach(); this.attach(this.target); }
    },
    {
      name: 'tipContents',
      documentation: function() {/*
        HTML element encapsulating the tooltip (rich) text.
      */},
      defaultValue: null
    },
    {
      name: 'attached',
      documentation: function() {/*
        Indicator variable for whether tooltip has been attached to the
        tooltip'd content.
      */},
      defaultValue: false
    },
    {
      type: 'Boolean',
      name: 'noarrow',
      documentation: function() {/*
        Polymer attribute: noarrow.
      */},
      defaultValue: false,
      postSet: function(prev, next) {
        this.updateAttribute('noarrow', prev, next);
      }
    },
    {
      name: 'position',
      documentation: function() {/*
        Polymer attribute: position.
      */},
      defaultValue: 'bottom',
      preSet: function(prev, next) {
        if ( this.POSITIONS.some(function(pos) { return pos === next; }) ) {
          return next;
        } else {
          return prev;
        }
      },
      postSet: function(prev, next) {
        this.updateAttribute('bottom', prev, next);
      }
    },
    {
      type: 'Boolean',
      name: 'show',
      documentation: function() {/*
        Polymer attribute: show.
      */},
      defaultValue: false,
      postSet: function(prev, next) {
        this.updateAttribute('show', prev, next);
      }
    },
    {
      name: 'tipAttribute',
      documentation: function() {/*
        Polymer attribute: tipAttribute.
      */},
      todo: function() {/*
        (markdittmer): This isn't working with non-default values
      */},
      defaultValue: 'tip',
      postSet: function(prev, next) {
        this.updateAttribute('tipAttribute', prev, next);
      }
    }
  ],

  constants: {
    HREF: '/bower_components/core-tooltip/core-tooltip.html',
    POSITIONS: ['top', 'bottom', 'left', 'right'],
    POLYMER_PROPERTIES: [
      'noarrow',
      'position',
      'bottom',
      'show',
      'tipAttribute'
    ]
  },

  methods: [
    { name: 'open', code: function() {} },
    { name: 'close', code: function() {} },
    { name: 'destroy', code: function() {} },
    {
      name: 'init',
      code: function() {
        var rtn = this.SUPER();
        this.tooltip = this.document.createElement(this.tagName);
        this.tooltip.setAttribute('id', this.id);
        this.updateProperties();
        return rtn;
      }
    },
    {
      name: 'setContents',
      documentation: function() {/*
        Set the contents of the tooltip (rich) text in the view.
      */},
      code: function() {
        if ( this.html ) this.tipContents.innerHTML   = this.html;
        else             this.tipContents.textContent = this.text;
      }
    },
    {
      name: 'updateContents',
      documentation: function() {/*
        Update the contents of the tooltip (rich) text in the view. Add or
        remove main tooltip HTML when switching from/to the empty string.
      */},
      code: function() {
        if ( this.html || this.text ) {
          if ( ! this.attached ) this.attach();
          else                   this.setContents();
        } else if ( this.attached ) {
          this.detach();
        }
      }
    },
    {
      name: 'attach',
      documentation: function() {/*
       The Polymer tooltip element wraps around the element for which it
       provides help. As such, attaching entails juggling the main content
       and the new tooltip element within the main content's parent's DOM
       sub-tree.
     */},
      code: function(elem) {
        if ( ! ( ( this.text || this.html ) && this.tooltip ) ||
             this.attached ) return;

        this.tooltip.setAttribute('id', this.id);

        var parent = elem.parentNode;
        parent.insertBefore(this.tooltip, elem);
        parent.removeChild(elem);

        this.tooltip.insertBefore(elem, this.tooltip.firstChild);

        this.tipContents = this.document.createElement('div');
        this.tipContents.setAttribute(this.tipAttribute, '');
        this.tooltip.appendChild(this.tipContents);
        this.setContents();

        this.attached = true;
      }
    },
    {
      name: 'detach',
      documentation: function() {/*
       The Polymer tooltip element wraps around the element for which it
       provides help. As such, detaching entails juggling the main content
       and the new tooltip element within the main tooltip's parent's DOM
       sub-tree.
     */},
      todo: function() {/*
        (markdittmer): Use of children below will skip text that is not wrapped
        in a node.
      */},
      code: function(prevTooltip) {
        if ( ! this.attached ) return;

        if ( this.tipContents ) {
          prevTooltip.removeChild(this.tipContents);
          this.tipContents = null;
        }

        var parent = prevTooltip.parentNode;
        var newHTML = prevTooltip.innerHTML;
        for (var i = 0; i < prevTooltip.children.length; ++i) {
          var child = prevTooltip.children[i];
          prevTooltip.removeChild(child);
          parent.insertBefore(child, prevTooltip);
        }
        parent.removeChild(prevTooltip);
        prevTooltip.setAttribute('id', '');

        this.attached = false;
      }
    }
  ]
});
