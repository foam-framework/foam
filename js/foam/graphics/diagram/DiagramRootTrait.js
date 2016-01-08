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
  package: 'foam.graphics.diagram',
  name: 'DiagramRootTrait',
  
  requires: [ 'MDAO', 'foam.graphics.diagram.DiagramItemTrait' ],
  
  documentation: function() {/*
      Apply this trait to the model you wish to use as the root
      element of your diagram. It adds support for link routing.
    */}, 

  properties: [
    {
      name: 'linkBlockerDAO',
      model_: 'foam.core.types.DAOProperty',
      factory: function() {
        return this.MDAO.create({model:this.DiagramItemTrait, autoIndex:true});
      }
    }
  ],
  
  methods: {
    addLinkBlocker: function(item) {
      /* Called by child when added to a parent, to report that it can block
      link routing. */
      if ( item.isLinkBlocking ) {
        this.linkBlockerDAO.put(item);
      }
    },

    removeLinkBlocker: function(item) {
      /* Called by child when removed from a parent, to report that it can 
      no longer block link routing. */
      this.linkBlockerDAO.remove(item);
    },
    
    getDiagramRoot: function() {
      return this;
    },
    
    scanForLinkBlockers: function() {
      /* In this base case we can clear out the exisiting DAO of blockers,
      since we will regenerate it anyway. */
      this.linkBlockerDAO.removeAll();
      this.SUPER();
    }

  }
  
});

