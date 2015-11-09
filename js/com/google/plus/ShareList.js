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

  models: [
    {
      name: 'HistoryItem',
      properties: [
        { model_: 'StringProperty', name: 'id' },
        { model_: 'StringProperty', name: 'displayName' },
        { model_: 'StringProperty', name: 'type' },
      ]
    }
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
      name: 'owner'
    },
    {
      model_: 'ReferenceArrayProperty',
      name: 'circles',
      subType: 'com.google.plus.Circle',
      help: "References to the owner's actual circles, to which to share."
    },
    {
      model_: 'ReferenceArrayProperty',
      name: 'people',
      subType: 'com.google.plus.Person',
      help: 'People to which to share.',
    },
    {
      model_: 'ArrayProperty',
      name: 'history',
      subType: 'com.google.plus.ShareList.HistoryItem',
      factory: function() { return [].dao; }
    },
    {
      model_: 'BooleanProperty',
      name: 'sharesPending',
      getter: function() {
        return (this.instance_.circles && this.instance_.circles.length) ||
          (this.instance_.people && this.instance_.people.length);
      }
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
            self.moveToHistory(c);
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

    function moveToHistory(item) {
      this.history.put(this.HistoryItem.create({
        id: item.id,
        displayName: item.displayName,
        type: item.type
      }));

      this.circles.remove(item.id);
      this.people.remove(item.id);
    }
  ],

});