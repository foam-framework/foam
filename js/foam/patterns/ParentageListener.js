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
  package: 'foam.patterns',
  name: 'ParentageListener',
  documentation: "Tracks changes in a parent chain and runs bind/unbind functions as parents enter or leave.",

  properties: [
    {
      name: 'data',
      preSet: function(old,nu) {
        // new data, so clean out all old parents
        if (this.boundParents_) this.removeParents(this.boundParents_);
        return nu;
      },
      postSet: function() {
        // bind parents, add listeners for parent changes
        this.updateChain();
      },
    },
    {
      name: 'bindFn',
      type: 'Function',
      preSet: function(old,nu) {
        if (nu && this.boundParents_) {
          this.boundParents_.map(nu); // we have items we're attached to, but didn't run bindFn on!
        }
        return nu;
      },
    },
    {
      name: 'unbindFn',
      type: 'Function',
    },
    {
      name: 'boundParents_',
      hidden: true,
      documentation: "The items we have bound to, for later cleanup",
      //factory: function() { return []; }
    }
  ],
  methods: {
    removeParents: function(pList) {
      pList.clone().forEach(function(p) {
        p.parent$.removeListener(this.updateChain);
        if (this.unbindFn) this.unbindFn(p);
        this.boundParents_.remove(p);
        // don't recurse here since we already know exactly what we've bound to,
        //  and parentage may have changed
      }.bind(this));
    },
    addParent: function(p) {
      if (this.boundParents_.indexOf(p) === -1) { // we don't already have it
        if (this.bindFn) this.bindFn(p);
        p.parent$.addListener(this.updateChain);
        this.boundParents_.push(p);

        // recurse on parents of p
        if (p.parent) this.addParent(p.parent);
      }
    }
  },
  listeners: [
    {
      name: 'updateChain',
      isFramed: true,
      code: function() {
        if (!this.boundParents_) this.boundParents_ = [].clone();
        // brute force: remove all, redo parent chain
        this.removeParents(this.boundParents_);
        this.addParent(this.data);
      }
    }
  ]

});
