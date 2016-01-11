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
  package: 'foam.dao',
  name: 'SeqNoDAO',
  label: 'foam.dao.SeqNoDAO',

  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
   Set a specified properties value with an auto-increment
   sequence number on DAO.put() if the properties value
   is set to the properties default value.
  */},
  properties: [
    {
      name: 'property',
      type: 'Property',
      required: true,
      hidden: true,
      defaultValueFn: function() {
        return this.delegate.model ? this.delegate.model.ID : undefined;
      },
      transient: true
    },
    {
      type: 'Int',
      name: 'sequenceValue',
      defaultValue: 1
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var future = afuture();
      this.WHEN_READY = future.get;

      // Scan all DAO values to find the largest
      this.delegate.select(MAX(this.property))(function(max) {
        if ( max.max ) this.sequenceValue = max.max + 1;
        future.set(true);
      }.bind(this));
    },
    put: function(obj, sink) {
      this.WHEN_READY(function() {
        var val = this.property.f(obj);

        if ( ! val || val == this.property.defaultValue ) {
          obj[this.property.name] = this.sequenceValue++;
        }

        this.delegate.put(obj, sink);
      }.bind(this));
    }
  }
});
