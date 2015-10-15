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
  package: 'foam.documentation',
  name: 'ModelDocView',
  extends: 'foam.documentation.DocView',
  documentation: 'Displays the documentation of the given Model.',
  traits: ['foam.documentation.DocModelFeatureDAOTrait'],

  documentation: function() {/*
    Displays the documentation for a given $$DOC{ref:'Model'}. The viewer will
    destroy and re-generate sub-views when the $$DOC{ref:'.data'} changes.
  */},

  imports: ['documentViewRef'],

  listeners: [
    {
      name: 'doScrollToFeature',
      isFramed: true,
      code: function() {
        this.scrollToFeature();
      }
    }
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old,nu) {
        this.processModelChange();
      }
    }
  ],

  methods: {

    init: function() {
      this.SUPER();

      this.documentViewRef.addListener(this.doScrollToFeature);
      this.generateFeatureDAO(this.data);
    },

//     destroy: function( isParentDestroyed ) {
//       this.SUPER(isParentDestroyed);
//       this.documentViewRef.removeListener(this.doScrollToFeature);
//     },

    processModelChange: function() {
      // abort if it's too early //TODO: (we import data and run its postSet before the rest is set up)
      if (!this.featureDAO || !this.modelDAO) return;
      this.generateFeatureDAO(this.data);
      this.updateHTML(); // not strictly necessary, but seems faster than allowing children to update individually
    },

    initInnerHTML: function() {
      /* If a feature is present in the this.documentViewRef $$DOC{ref:'foam.documentation.DocRef'},
        scroll to that location on the page. Otherwise scroll to the top. */
      this.SUPER();

      this.scrollToFeature();
    },

    scrollToFeature: function() {
      var self = this;
      var ref = self.documentViewRef.get();
      if (ref && ref.valid) {
        if (! // if we don't find an element to scroll to:
          ref.resolvedRef.split('.').slice(1).reverse().some(function(feature) {
            if (feature) {
              element = this.X.$("scrollTarget_"+feature);
              if (element) {
                element.scrollIntoView(true);
                return true;
              }
              else return false;
            }
          })
        ) {
          // if we didn't find an element to scroll, use main view
          if (self.$) self.$.scrollIntoView(true);
        }
      }
    }
  }
});
