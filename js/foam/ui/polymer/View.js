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
  name: 'View',
  package: 'foam.ui.polymer',

  extends: 'foam.ui.View',

  properties: [
    {
      type: 'Model',
      name: 'tooltipModel',
      defaultValue: 'foam.ui.polymer.Tooltip'
    },
    {
      model_: 'foam.core.types.DocumentInstallProperty',
      name: 'registerElement',
      documentInstallFn: function(X) {
        if ( ! this.HREF ) return;
        var l = X.document.createElement('link');
        l.setAttribute('rel', 'import');
        l.setAttribute('href', this.HREF);
        X.document.head.appendChild(l);
      }
    }
  ],


  methods: [
    {
      name: 'maybeInitTooltip',
      code: function() {
        if ( this.tooltipModel && ! this.tooltip_ ) {
          this.tooltip_ = this.tooltipModel.create({
            text: this.tooltip,
            target: this.$
          });
        }
      }
    },
    {
      name: 'updateAttribute',
      code: function(name, prev, next) {
        if ( ! this.$ || prev === next ) return;

        if ( next ) {
          if (next !== true) this.$.setAttribute(name, next);
          else               this.$.setAttribute(name, '');
        } else {
          this.$.removeAttribute(name);
        }
      }
    },
    {
      name: 'updateProperties',
      code: function() {
        if ( ! this.POLYMER_PROPERTIES ) return;

        this.POLYMER_PROPERTIES.forEach(function(attrName) {
          this.updateAttribute(attrName, undefined, this[attrName]);
        }.bind(this));
      }
    },
    {
      name: 'initHTML',
      code: function() {
        var rtn = this.SUPER();
        this.updateProperties();
        return rtn;
      }
    }
  ],

  listeners: [
    {
      name: 'openTooltip',
      documentation: function() {/*
        The base View class binds an openTooltip listener to anything with a
        tooltip. Polymer tooltips attach/detach when tooltip text is available,
        so this is a no-op.
      */},
      code: function() {}
    },
    {
      name: 'closeTooltip',
      documentation: function() {/*
        The base View class binds an closeTooltip listener to anything with a
        tooltip. Polymer tooltips attach/detach when tooltip text is available,
        so this is a no-op.
      */},
      code: function() {}
    }
  ]
});
