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
  package: 'foam.ui',
  name: 'CollapsibleView',
  extends: 'foam.ui.View',

  properties: [
    {
      name:  'fullView',
      documentation: function() {/*
        The large, expanded view to show.
      */}
    },
    {
      name:  'collapsedView',
      documentation: function() {/*
        The small, hidden mode view to show.
      */}

    },
    {
      name: 'collapsed',
      documentation: function() {/*
        Indicates if the collapsed or full view is shown.
      */},
      defaultValue: true,
      postSet: function() {
        if (this.collapsed) {
          this.collapsedView.$.style.height = "";
          this.fullView.$.style.height = "0";

        } else {
          this.collapsedView.$.style.height = "0";
          this.fullView.$.style.height = "";
        }
      }
    }

  ],

  methods: {
    toHTML: function() {
      /* Just render both sub-views, and control their height to show or hide. */

      // TODO: don't render full view until expanded for the first time?
      if (this.collapsedView && this.fullView) {
        var retStr = this.collapsedView.toHTML() + this.fullView.toHTML();
        this.addDataChild(this.collapsedView);
        this.addDataChild(this.fullView);
      } else {
        console.warn(model_.id + " missing "
            + ( this.collapsedView ? "" : "collapsedView" )
            + ( this.fullView ? "" : "fulleView" ));
      }
      return retStr;
    },

    initHTML: function() {
      this.SUPER();
      /* Just render both sub-views, and control their height to show or hide. */

      if (this.collapsedView.$ && this.fullView.$) {
        // to ensure we can hide by setting the height
        this.collapsedView.$.style.display = "block";
        this.fullView.$.style.display = "block";
        this.collapsedView.$.style.overflow = "hidden";
        this.fullView.$.style.overflow = "hidden";
        this.collapsed = true;
      }
    }
  },

  actions: [
    {
      name:  'toggle',
      help:  'Toggle collapsed state.',

      labelFn: function() {
        return this.collapsed? 'Expand' : 'Hide';
      },
      isAvailable: function() {
        return true;
      },
      isEnabled: function() {
        return true;//this.collapsedView.toHTML && this.fullView.toHTML;
      },
      code: function() {
        this.collapsed = !this.collapsed;
      }
    },
  ]
});
