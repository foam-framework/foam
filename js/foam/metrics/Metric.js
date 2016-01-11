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
  name: 'Metric',
  package: 'foam.metrics',

  properties: [
    {
      type: 'Int',
      name: 'id'
    },
    {
      type: 'String',
      name: 'name',
      documentation: function() {/*
        Meaning varies based on $$DOC{ref:'.type'}.
        <p>$$DOC{ref:'.type'} = timing => User timing variable name</p>
        <p>$$DOC{ref:'.type'} = error  => Exception description</p>
        <p>$$DOC{ref:'.type'} = event  => Event action</p>
        <p>$$DOC{ref:'.type'} = screenview  => Screen name</p>
      */},
    },
    {
      type: 'Int',
      name: 'value',
      defaultValue: 1
    },
    {
      type: 'Boolean',
      name: 'interactive',
      defaultValue: true
    },
    {
      type: 'String',
      name: 'subType',
      defaultValue: 'metrics'
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'type',
      help: 'Optional hint as to what type of metric this is.',
      defaultValue: 'event',
      choices: [
        'event',
        'count',
        'timing',
        'error',
        'pageview',
        'screenview'
      ]
    },
    {
      type: 'Int',
      name: 'created',
      factory: function() { return Date.now(); }
    },
  ],

  methods: {
    start: function() {
      var startTime = Date.now();
      return function(ret) {
        var endTime = Date.now();
        this.value = endTime - startTime;
        ret && ret.apply(null, arguments);
      };
    }
  }
});
