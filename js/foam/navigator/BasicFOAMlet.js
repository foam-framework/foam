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
  name: 'BasicFOAMlet',
  extends: 'foam.navigator.FOAMlet',
  package: 'foam.navigator',

  documentation: function() {/* A base model for native FOAMlets. If you are
    wrapping an existing model, use a $$DOC{ref:'foam.navigator.WrappedFOAMlet'}.
  */},

  properties: [
    {
      name: 'type',
      defaultValueFn: function() { return this.model_.label; }
    },
    {
      name: 'model',
      defaultValueFn: function() { return this.model_; }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();
        this.subscribe(
            ['property'],
            function(model, o, notificationData) {
              if ( notificationData[0] !== 'property' ||
                  notificationData[1] === 'lastModified' ||
                  ! model || ! model.properties_ ) return;
              var propName = notificationData[1];
              var propMatch = model.getRuntimeProperties().filter(function(propName, prop) {
                return prop.name == propName;
              }.bind(this, propName))[0];
              if ( ! propMatch || propMatch.hidden ) return;
              console.log('Updating lastModified');
              o.lastModified = Date.now();
            }.bind(this, this.model_));
      }
    }
  ]
});
