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
  name: 'ShareList',
  package: 'com.google.plus',

  requires: [
    'com.google.plus.Person',
    'com.google.plus.Circle',
  ],

  imports: [
    'personDAO'
  ],

  documentation: function() {/* A list of people and or circles. When
    sharing is locked in, the circles are flattened into a list of
    people. The circle names are retained for UI use. */},

  properties: [
    {
      model_: 'ReferenceProperty',
      subType: 'com.google.plus.Person',
      name: 'owner',
    },
    {
      model_: 'ReferenceArrayProperty',
      name: 'circles',
      subType: 'com.google.plus.Circle',
      help: "References to the owner's actual circles"
    },
    {
      model_: 'ReferenceArrayProperty',
      name: 'people',
      subType: 'com.google.plus.Person',
    },
    {
      model_: 'StringArrayProperty',
      name: 'circleNames',
      help: "After flattening, circles will be empty and the names listed here."
    },
    {
      model_: 'BooleanProperty',
      name: 'shareComplete',
      defaultValue: false,
    }
  ],

  methods: [
    function flatten(opt_owner) {
      /* Flattens the list of people currently in the shared
        $$DOC{ref:'com.google.plus.Circle',usePlural:true}. After
        a $$DOC{ref:'.flatten'}, $$DOC{ref:'.circles'} will be empty,
        $$DOC{ref:'.circleNames'} will contain the display names of the
        flattened circles, and all the
        $$DOC{ref:'com.google.plus.Person',usePlural:true} from those circles
        will have been added to $$DOC{ref:'.people'}. If you already have
        the owner Person available, you can pass it in (opt_owner.id must
        match this.owner). If not, it will be looked up in the personDAO. */

      var self = this;

      // TODO: error case: retain circles that can't be flattened
      var flatize = function(owner) {
        var circs = self.circles;
        self.circles = [];
        // lookup each circle ID from the owner's circles
        for (var i=0; i<circs.length; ++i) {
          owner.circles.find(circs[i], { put: function(c) {
            // remember name for display purposes
            self.circleNames.push(c.displayName);
            // grab all circle member references
            c.people.select(MAP(this.Person.ID, self.people));
          }});
        }
      }

      if ( opt_owner && opt_owner.id === this.owner ) {
        // valid owner supplied by caller
        flatize(opt_owner);
      } else {
        // lookup owner reference (TODO: should always be X.currentUser?)
        self.personDAO && self.personDAO.find(self.owner, {
          put: flatize
        });
      }
    },
  ],

});
