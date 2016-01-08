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
  package: 'foam.ui',
  name: 'DestructiveDataView',
  extends: 'foam.ui.BaseView',

  requires: [ 'SimpleValue' ],

  documentation: function() {/* For Views that use $$DOC{ref:'.data'}.
    The childData reference may be cut loose when children are to be
    destroyed, preventing unneeded updates from propagating to them.</p>
  */},

  properties: [
    {
      name: 'data',
      documentation: function() {/* The actual data used by the view.
        $$DOC{ref:'.childDataValue'} is updated when $$DOC{ref:'.data'}
        changes, and is cut loose when children are to be destroyed.
        If a child changes its data, that change will not be propagated back
        up (however changes inside of the object are fine).
      */},
      preSet: function(old,nu) {
        if ( this.shouldDestroy(old,nu) ) {
          // destroy children
          this.destroy();
        }
        return nu;
      },
      postSet: function(old,nu) {
        if ( this.shouldDestroy(old,nu) ) {
          // rebuild children with new data (propagation will happen implicitly)
          this.construct();
        }
      }
    },
    {
      name: 'dataLinkedChildren',
      //type: 'Array[foam.patterns.ChildTreeTrait]',
      factory: function() { return []; }
    }
  ],

  methods: {
    shouldDestroy: function(old,nu) {
      /* Override to provide the destruct condition. When data changes,
         this method is called. Return true to destroy(), cut loose children
         and construct(). Return false to retain children and just propagate
         the data change. */
      return true;
    },
    destroy: function( isParentDestroyed ) {
      if ( ! isParentDestroyed ) {
        // unlink children
        this.dataLinkedChildren.forEach(function(child) {
          Events.unfollow(this.data$, child.data$);
        }.bind(this));
        this.dataLinkedChildren = [];
      }// else {
//        var parentName = this.parent.name_;
//         this.data$.addListener(function() {
//           console.warn("Data changed after fast-destroy! ", this.name_, parentName);
//         }.bind(this));
//      }
      this.SUPER(isParentDestroyed);
    },
    addDataChild: function(child) {
      /* For children that link to data$, this method tracks them
        for disconnection when we destroy. */
      Events.follow(this.data$, child.data$);
      this.dataLinkedChildren.push(child);
      this.addChild(child);
    }
  }
});
