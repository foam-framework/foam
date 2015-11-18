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
  name: 'SubstreamSink',
  package: 'com.google.ow',
  //extends: 'foam.dao.ProxyDAO',

  requires: [
    'com.google.ow.model.Envelope',
  ],

  imports: [
    'personDAO',
    'streamDAO',
    'createStreamItem',
  ],

  documentation: function() {/* When a streamDAO update hits the server,
      this listener will find the associated local content in the streamDAO
      using the streamId, instantiate the content, and allow it to process
      the new content item, which can be a new item or event.

      Targets that support addressing by SID should implement a
      put(envelope) method to handle incoming envelopes.
    */},

  methods: [
    function put(o, sink) {
      // TODO: rename .sid to .addr (Box address?)
      if ( o.substreams ) {
        this.putToTargets(o, sink);
      }
    },
    function remove(o, sink) {
      // TODO: does remove() need to be supported?
      console.warn("SubstreamSink: remove() not implemented.");
    },

    function putToTargets(env, sink) {
      var self = this;
      // TODO: eventually the target could be a third party URL, so we
      // would load that instead of hitting the streamDAO
      // TODO: if we don't find exact match, try for partial

      var processSID = function(currSID) {
        var found = false; // TODO: stop if found, or always hit all root sids?
        console.log("SubstreamSink trying SID: ", currSID);
        self.streamDAO.where(IN(self.Envelope.SUBSTREAMS, currSID)).select({
          put: function(target) {
            // TODO: anything else to do to "wake" the cloned targets the DAO
            // gives us? (are listeners connected, etc.?)
            found = true;
            target.put && target.put(env, sink);
          },
          eof: function() {
            if ( ! found ) {
              console.log("   SubstreamSink SID",currSID,"not found, retrying...");
              processSID(currSID.split('/').splice(-1, 1).join('/'));
            }
          }
        });
      };

      processSID(env.sid);
    }
  ],
});
