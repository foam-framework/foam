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
  name: 'PropertyCitationView',
  package: 'foam.apps.builder.datamodels.meta.types',
  extends: 'foam.apps.builder.datamodels.meta.types.CitationView',

  imports: [
    'properties$',
  ],

  properties: [
    {
      type: 'Int',
      name: 'moveMode',
      defaultValue: 0,
    },
    {
      type: 'Int',
      name: 'index',
      defaultValue: -1,
    },
    {
      name: 'properties',
      postSet: function(old, nu) {
        old && old.unlisten(this.propertiesDAOChange);
        nu && nu.listen(this.propertiesDAOChange);
        this.calcIndex();
      },
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old) old.removeListener(this.calcIndex);
        if ( nu ) nu.addListener(this.calcIndex);
        this.calcIndex();
      }
    },
    {
      name: 'propertyTracker_',
      defaultValue: 0,
    }
  ],

  actions: [
    {
      name: 'move',
      ligature: 'reorder',
      label: 'Re-order',
      isAvailable: function() {
        this.mode; this.moveMode; this.properties; this.propertyTracker_;
        return this.mode == 'read-write' &&
          (! this.moveMode) &&
          this.properties && (this.properties.length > 1);
      },
      code: function() {
        this.addMoveExpiry();
      },
    },
    {
      name: 'moveUp',
      label: 'Move Up',
      ligature: 'keyboard_arrow_up',
      isAvailable: function() {
        this.moveMode; this.mode; this.index; this.propertyTracker_;
        return this.moveMode &&
          this.mode == 'read-write' &&
          this.index > 0;
      },
      code: function() {
        this.addMoveExpiry();

        var swap = this.properties[this.index - 1];
        this.properties[this.index - 1] = this.data;
        this.properties[this.index] = swap;

        // notify
        this.calcIndex();
        this.properties.notify_('reset',{});
        this.data.propertyChange('name', null, this.data.name);
        swap.propertyChange('name', null, swap.name);
      },
    },
    {
      name: 'moveDown',
      label: 'Move Down',
      ligature: 'keyboard_arrow_down',
      isAvailable: function() {
        this.moveMode; this.mode; this.index; this.properties;  this.propertyTracker_;
        return this.moveMode &&
          this.mode == 'read-write' &&
          this.index >= 0 &&
          this.properties && (this.index < this.properties.length-1);
      },
      code: function() {
        this.addMoveExpiry();

        var swap = this.properties[this.index + 1];
        this.properties[this.index + 1] = this.data;
        this.properties[this.index] = swap;

        // notify
        this.calcIndex();
        this.properties.notify_('reset',{});
        this.data.propertyChange('name', null, this.data.name);
        swap.propertyChange('name', null, swap.name);
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.calcIndex();
    },

    function addMoveExpiry() {
      this.moveMode = this.moveMode + 1;
      this.X.setTimeout(function() {
        this.moveMode = Math.max(this.moveMode - 1, 0);
      }.bind(this), 3000);
    },
  ],
  listeners: [
    {
      name: 'calcIndex',
      code: function() {
        var props = this.properties;
        if ( props ) {
          for (var i = 0; i < props.length; ++i) {
            if (props[i] === this.data) {
              this.index = i;
              return;
            }
          }
        }
        this.index = -1;
      }
    },
    {
      name: 'propertiesDAOChange',
      code: function() {
        this.propertyTracker_ += 1;
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="meta-citation-view-labels">
          $$name{ model_:'foam.ui.StringElideTextualView', extraClassName: 'meta-citation-view-title' }
          $$label{ model_:'foam.ui.md.TextFieldView', floatingLabel: false, extraClassName: 'md-grey meta-citation-view-editors', mode$: this.mode$ }
        </div>
        <div class="property-citation-view-buttons">
          $$edit{ color: 'black' }
          $$move{ color: 'black' }
          $$moveUp{ color: 'black' }
          $$moveDown{ color: 'black' }
        </div>
      </div>
    */},
    function CSS() {/*
      .property-citation-view-buttons {
        min-width: 170px;
        max-width: 170px;
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
      }

    */},

  ]

});

