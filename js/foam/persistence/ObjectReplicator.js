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
  package: 'foam.persistence',
  name: 'ObjectReplicator',
  implements: ['foam.dao.DAOListener'],
  properties: [
    {
      name: 'id',
    },
    {
      name: 'model',
      type: 'Model'
    },
    {
      name: 'dao',
      type: 'DAO'
    },
    {
      model_: 'BooleanProperty',
      name: 'feedback',
      defaultValue: false
    },
    {
      name: 'pk',
      lazyFactory: function() {
        // TODO: Support multi part keys
        return this.model.getProperty(this.model.ids[0]);
      },
      javaFactory: 'return this.model.getProperty(this.model.ids[0]);'
    },
    {
      name: 'future',
      labels: ['javascript'],
      lazyFactory: function() {
        var self = this;
        var fut = afuture();
        this.dao.find(self.id, {
          put: function(obj) {
            fut.set(obj);
          }
        });
        fut.get(function(o) {
          self.obj = o;
          self.attach();
        })
        return fut;
      },
    }
  ],
  methods: [
    {
      name: 'destroy',
      code: function() {
        this.obj.removeListener(this.objChanged);
        this.dao.unlisten(this);
      },
      javaCode: 'this.obj.removeListener(this.objChanged);\nthis.dao.unlisten(this);\n'
    },
    {
      name: 'attach',
      code: function() {
        this.obj.addListener(this.objChanged);
        this.dao.where(EQ(this.pk, this.obj.id)).listen(this);
      },
      javaCode: 'this.obj.addListener(this.objChanged);\nthis.dao.where(EQ(this.pk, this.obj.id)).listen(this);\n'
    }
  ],
  listeners: [
    {
      name: 'objChanged',
      code: function(o) {
        if ( this.feedback )
          return;

        var clone = this.obj.deepClone();
        this.dao.put(clone, {
          put: function(obj2) {
            this.obj.copyFrom(obj2);
          }.bind(this)
        });
      },
      javaCode: multiline(function() {/*
        if ( this.feedback )
          return;

        FObject clone = this.obj.deepClone();
        FObject result = this.dao.put(this.X, clone);
        this.obj.copyFrom(result);
      */})
    },
    {
      name: 'put',
      code: function() {
        this.dao.find(this.id, {
          put: function(obj2) {
            if ( ! this.obj ) {
              this.future.set(obj2);
            } else {
              this.feedback = true;
              this.obj.copyFrom(obj2);
              this.feedback = false;
            }
          }.bind(this)
        });
      },
      javaCode: multiline(function() {/*
        FObject obj = this.dao.find(this.X, this.id);
        this.feedback = true;
        this.obj.copyFrom(obj);
        this.feedback = false;
      */})
    },
    {
      name: 'remove',
      code: function() {},
      javaCode: ''
    }
  ]
});
