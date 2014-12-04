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
  name: 'DataProviderTrait',
  package: 'foam.views',
  
  documentation: function() {/*
    Trait for providers of a data property. It contains a $$DOC{ref:'.data'}
    property and exports it by reference to the context.
  */},
  
  exports: ['data$ as data$'],
  
  properties: [
    {
      name: 'data',
      help: 'Downstream data value provided to consumers.',
      documentation: function() {/* 
        The value provided to consumers downstream (children) of this provider.
      */},
      preSet: function(old, nu) {
        // if the new data from downstream is ok, let it be set and propagate
        if (this.internallySettingDownstream_ ||
            this.validateDownstreamChange(old, nu) {
          return nu;
        } else {
          return old;
        }
      },
      postSet: function(old, nu) {
        if (!internallySettingDownstream_) {
          propagateDownstreamChange(old, nu);
        }
      }
    },
    {
      name: 'internallySettingDownstream_',
      model_: 'BooleanProperty',
      defaultValue: false
    }
  ],

  methods: {
    internalSetDownstreamData: function(nu) { /* Sets $$DOC{ref:'.data'} without invoking
                            validator and propagators. */
        this.internallySettingDownstream_ = true;
        this.data = nu;
        this.internallySettingDownstream_ = false;
    },
    
    validateDownstreamChange: function(old, nu) {
      /* Override to validate changed data from downstream consumers.
      Return true if the change is good to process and propagate upstream.
      Returning false will force the downstream data back to its old value. */
      return true;
    },
    propagateDownstreamChange: function(old, nu) {
      /* Override to transform data from downstream children and pass 
      changes upstream. Propagation may be stopped here if changes should
      not interest the provider. */
    }, 
  }
  
});
 
  
CLASS({
  name: 'DataConsumerTrait',
  package: 'foam.views',
  
  documentation: function() {/*
    Trait for consumers of a data property. It contains 
    an $$DOC{ref:'.upstreamData'}
    property and imports it by reference from the context.
  */},
  
  imports: ['data$ as upstreamData$'],
  
  properties: [
    {
      name: 'upstreamData',
      help: 'Upstream data value from provider.',
      documentation: function() {/* 
        The value provided from upstream (by the parent).
      */}
      postSet: function(old, nu) {
        // check if we should progagate the change, if so, set data
        if (!internallySettingUpstream_) {
          propagateUpstreamChange(old, nu);
        }
      }
    },
    {
      name: 'internallySettingUpstream_',
      model_: 'BooleanProperty',
      defaultValue: false
    }

  ],
  
  methods: {
    internalSetUpstreamData: function(nu) { /* Sets $$DOC{ref:'.upstreamData'} without invoking
                            validator and propagators. */
        this.internallySettingUpstream_ = true;
        this.upstreamData = nu;
        this.internallySettingUpstream_ = false;
    },

    propagateUpstreamChange: function(old, nu) {
      /* Override to halt or transform data propagating downstream to children.</p>
      <p>Transformation may include unpacking a value from the 
      $$DOC{ref:'.upstreamData'} and binding that to $$DOC{ref:'.data'}.</p>
      <p>One example of halting propagation would be if the data value
      changes enough that the current children will be destroyed, so
      propagation before they are re-created is a waste. */
    }
  }


});
 
CLASS({
  name: 'DataHandlerTrait',
  package: 'foam.views',
  traits: ['foam.views.DataConsumerTrait', 'foam.views.DataProviderTrait'],
  
  documentation: function() {/* 
    Trait for consumer/providers of data that process or make decisions based
    on the data content.
  */},
     
  methods: {
    validateDownstreamChange: function(old, nu) {
      /* Override to validate changed data from downstream consumers.
      Return true if the change is good to process and propagate upstream.
      Returning false will force the downstream data back to its old value. */
      return true;
    },
    propagateDownstreamChange: function(old, nu) {
      /* Override to transform data from downstream children and pass 
      changes upstream. Propagation may be stopped here if changes should
      not interest the provider. */
      
      // by default, passthrough
      this.upstreamData = nu;
    },
    propagateUpstreamChange: function(old, nu) {
      /* Override to halt or transform data propagating downstream to children.</p>
      <p>Transformation may include unpacking a value from the 
      $$DOC{ref:'.upstreamData'} and binding that to $$DOC{ref:'.data'}.</p>
      <p>One example of halting propagation would be if the data value
      changes enough that the current children will be destroyed, so
      propagation before they are re-created is a waste. */
      
      // by default, passthrough
      this.data = nu;
    } 
  }
  
});







