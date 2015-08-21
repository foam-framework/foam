/*
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
  name: 'ActionFactoryDAO',
  package: 'foam.core.dao',
  extendsModel: 'foam.dao.ProxyDAO',
  label: 'ActionFactoryDAO',

  properties: [
    {
      name: 'actionDao',
      type: 'DAO',
      hidden: true,
      required: true
    }
  ],

  methods: {
    put: function(value, sink) {
      var self = this;
      aseq(
        function(ret) {
          self.delegate.find(value.id, {
            put: function(obj) {
              ret(obj);
            },
            error: function() { ret(); }
          });
        },
        function(ret, existing) {
          if (existing) {
            existing.writeActions(
              value,
              self.actionDao.put.bind(self.actionDao));
          } else if (value.model_.createActionFactory) {
            value.model_.createActionFactory(function(actions) {
              for (var j = 0; j < actions.length; j++)
                self.actionDao.put(actions[j]);
            }, value);
          }
          self.delegate.put(value, sink);
          ret();
        })(function() {});
    },
    remove: function(value, sink) {
      if (value.model_.deleteActionFactory) {
        var actions = value.model_.deleteActionFactory(value);
        for (var j = 0; j < actions.length; j++)
          this.actionDao.put(actions[j]);
      }
      this.delegate.remove(value, sink);
    }
  }
});
