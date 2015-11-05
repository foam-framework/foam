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
  name: 'ShareSink',
  package: 'com.google.plus',

  requires: [
    'com.google.plus.Person',
    'com.google.plus.Circle',
  ],

  imports: [
    'personDAO',
    'streamDAO',
    'createStreamItem',
    //TODO: contentDAO (for the content inside streamDAO's envelopes)
  ],

  documentation: function() {/* Handles filtering out notifications based on
    mutual circleship. A put()ted object's shareWith property is checked,
    and if sender and reciever are mutually circling each other, the
    object is cloned to the receiver. */},

  methods: [
    function put(o) {
      var self = this;

      // lookup the owner
      self.personDAO.find(o.owner, { put: function(owner) {
        var shares = o.shares;
        shares.flatten(owner); // TODO: this is just-in-case. leave out? must put()

        var people = shares.people;

        self.personDAO.where(IN(self.Person.ID, people)).select({
          put: function(person) {
            // for each share target, check if they have owner in any circle
            // TODO: cache flattened list of ok ids for each target?
            if (self.isInCircles(owner, person)) {
              // TODO: error handling
              this.streamDAO.put(self.createStreamItem(owner, person, o.data));
            }
          }
        });


    },
  ],

  properties: [

  ],

});
