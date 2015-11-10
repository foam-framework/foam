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
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'com.google.plus.Person',
    'com.google.plus.Circle',
  ],

  imports: [
    'personDAO',
    'streamDAO',
    'createStreamItem',
    //TODO: contentDAO (for the content inside streamDAO's envelopes?)
  ],

  documentation: function() {/* Handles filtering out notifications based on
    mutual circleship. A put()ted object's shareWith property is checked,
    and if sender and reciever are mutually circling each other, the
    object is cloned to the receiver.

    Note that under current assumptions, a sub-stream adds content by
    copying the sub-stream's shareList into the new content. Once the
    new content hits the server, it is shared with the other participants
    of the sub-stream. Adding a user to the sub-stream
    on your end will cause them to see new updates, not get old ones.
    Removing a user would halt new updates, but not remove old ones.

    */},

  methods: [
    function put(o, sink) {
      var self = this;

      // run the sharing check after the put() succeeds
      self.delegate.put(o, {
        put: function(o) {
          self.checkShare(o);
          sink && sink.put(o);
        }
      })
    },

    function checkShare(o) {
      var self = this;
      if ( ! o.shares.sharesPending ) return;

      // lookup the owner
      self.personDAO.find(o.owner, {
        put: function(owner) {
          var shares = o.shares;
          shares.flatten(owner); // TODO: this is just-in-case. leave out? must put() modified o back
          var people = shares.flattenedPeople;
          self.putBack(o);

          self.personDAO.where(IN(self.Person.ID, people)).select({
            put: function(person) {
              // move direct person references to history list
              self.putBack(o);
              // for each share target, check if they have owner in any circle
              // TODO: cache flattened list of ok ids for each target?
              if (self.isInCircles(owner, person)) {
                // TODO: error handling
                self.streamDAO.put(self.createStreamItem(owner, person, o.data));//from, to, content
              }
            }
          });

        },
      });
    },

    function isInCircles(subject, circleOwner) {
      var circs = circleOwner.circles;
      for (var i=0; i<circs.length; ++i) {
        var people = circs[i].people;
        for (var j=0; j<people.length; ++j) {
          if ( people[j].id === subject.id ) return true;
        }
      }
      return false;
    },
  ],

  listeners: [
    {
      name: 'putBack',
      isMerged: 1000,
      code: function(o) {
        this.delegate.put(o); // TODO: UPDATE instead? Just want to change o.shares
      }
    },
  ]

});
