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
  package: 'foam.core.fo',
  name: 'BaseFeatureDAO',
  help: 'Exposes all features of a model as a unified DAO',
  extends: 'AbstractDAO',
  requires: [
    'foam.core.fo.Feature',
  ],
  properties: [
    {
      name: 'model',
      defaultValueFn: function() { return this.Feature; }
    },
    {
      name: 'value',
      postSet: function(old, nu) {
        if ( old ) old.removeListener(this.onDataUpdate);
        if ( nu ) {
          nu.addListener(this.onDataUpdate);
          this.onDataUpdate()
        }
      }
    }
  ],
  methods: [
    function select(sink, options) {
      sink = this.decorateSink_(sink || [], options);
      var fc = this.createFlowControl_();
      var self = this;
      var walk = function(pair) {
        var name = pair[0];
        var type = pair[1];
        var a = self.value[name];
        for ( var i = 0 ; i < a.length && ! fc.stopped && ! fc.errorEvt ; i++ ) {
          var f = self.Feature.create(a[i])
          f.type = type;
          f.model = a[i].model_.name;
          f.obj = a[i];
          sink.put(f, null, fc);
        }
      };
      var fields = [
        ['properties', 'Property'],
        ['methods', 'Method'],
        ['actions', 'Action'],
        ['listeners', 'Listener'],
        ['templates', 'Template'],
        ['messages', 'Message'],
        ['constants', 'Constant'],
        ['tests', 'UnitTest'],
        ['relationships', 'Relationship'],
        ['models', 'Model']
      ];
      fields.map(walk);
      var future = afuture();

      future.set(sink);

      if ( fc.errorEvt ) {
        sink.error && sink.error(fc.errorEvt);
      } else {
        sink.eof && sink.eof();
      }

      return future.get;
    },
    function put(obj, sink) {
      var map = {
        'Property': 'properties',
        'Method': 'methods',
        'Action': 'actions',
        'Listener': 'listeners',
        'Template': 'templates',
        'Message': 'messages',
        'Constant': 'constants',
        'UnitTest': 'tests',
        'Relationship': 'relationships',
        'Model': 'models'
      };
      sink && sink.error && sink.error();
    },
    function remove(obj, sink) {
    },
    function find(id, sink) {
    }
  ],
  listeners: [
    {
      name: 'onDataUpdate',
      code: function() {
        this.notify_('update', []);
      }
    }
  ]
});
