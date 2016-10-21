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
  properties: [
    {
      name: 'id',
      swiftType: 'String',
      swiftDefaultValue: '""',
      swiftPostSet: function() {/*
        self.dao.find(newValue, sink: ClosureSink(args: [
          "putFn": FoamFunction(fn: { [weak self] (args) -> AnyObject? in
            self?.future.set(args[0])
            self?.attach()
            return nil
          }),
          "errorFn": FoamFunction(fn: { [weak self] (args) -> AnyObject? in
            self?.attach()
            return nil
          }),
        ]))
      */},
    },
    {
      name: 'model',
    },
    {
      name: 'dao',
      swiftType: 'AbstractDAO',
    },
    {
      name: 'predicatedDao',
      swiftType: 'AbstractDAO',
    },
    {
      type: 'Boolean',
      name: 'feedback',
      defaultValue: false,
      swiftDefaultValue: 'false',
    },
    {
      name: 'obj',
      swiftType: 'FObject?',
      swiftPostSet: function() {/*
        if let oldValue = oldValue as? FObject {
          oldValue.addListener(self.objChangedListener_);
        }
        newValue?.addListener(self.objChangedListener_);
      */},
    },
    {
      name: 'pk',
      lazyFactory: function() {
        // TODO: Support multi part keys
        return this.model.getProperty(this.model.ids[0]);
      },
      swiftType: 'Property',
      swiftDefaultValueFn: function() {/*
        return Property(args: ["name": "id"])
      */},
    },
    {
      name: 'future',
      lazyFactory: function() {
        // TODO: Move this into the postSet of ID to match swift's behavior and
        // enable the ability to set the ID after the future has been accessed.
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
      swiftType: 'Future',
      swiftFactory: 'return Future()',
      swiftPostSet: function() {/*
        newValue.get { [weak self] o in
          if self != nil {
            self!.obj = o as? FObject
          }
        }
      */},
    },
    {
      name: 'daoListener',
      factory: function() {
        return {
          put: this.onPut,
          remove: this.onRemove
        };
      },
      swiftType: 'Sink',
      swiftFactory: function() {/*
        return ClosureSink(args: [
          "putFn": FoamFunction(fn: { [weak self] (args) -> AnyObject? in
            self?.onPut()
            return nil
          }),
          "removeFn": FoamFunction(fn: { [weak self] (args) -> AnyObject? in
            self?.onRemove()
            return nil
          })
        ])
      */},
    }
  ],
  methods: [
    {
      name: 'destroy',
      code: function() {
        this.obj.removeListener(this.objChanged);
        if (this.hasOwnProperty('predicatedDao')) {
          this.predicatedDao.unlisten(this.daoListener);
        }
      },
      swiftCode: function() {/*
        self.obj?.removeListener(self.objChangedListener_)
        if hasOwnProperty("predicatedDao") {
          self.predicatedDao.unlisten(self.daoListener)
        }
      */},
    },
    {
      name: 'attach',
      code: function() {
        this.obj.addListener(this.objChanged);
        this.predicatedDao = this.dao.where(EQ(this.pk, this.obj.id));
        this.predicatedDao.listen(this.daoListener)
      },
      swiftCode: function() {/*
        self.predicatedDao = self.dao.`where`(EQ(self.pk, arg2: self.id))
        self.predicatedDao.listen(self.daoListener)
      */},
    },
  ],
  listeners: [
    {
      name: 'objChanged',
      code: function() {
        if ( this.feedback )
          return;

        var clone = this.obj.deepClone();
        this.dao.put(clone, {
          put: function(obj2) {
            this.feedback = true;
            this.obj.copyFrom(obj2);
            this.feedback = false;
          }.bind(this)
        });
      },
      swiftCode: function() {/*
        if feedback { return }
        let clone = obj!.deepClone();
        dao.put(clone, sink: ClosureSink(args: [
          "putFn": FoamFunction(fn: { [weak self] (args) -> AnyObject? in
            if self == nil { return nil }
            let obj2 = args[0]
            self!.feedback = true;
            self!.obj!.copyFrom(obj2);
            self!.feedback = false;
            return nil
          })
        ]))
      */},
    },
    {
      name: 'onPut',
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
      swiftCode: function() {/*
        dao.find(id, sink: ClosureSink(args: [
          "putFn": FoamFunction(fn: { [weak self] (args) -> AnyObject? in
            if self == nil { return nil }
            let obj2 = args[0] as! FObject
            if self!.obj == nil {
              self!.future.set(obj2);
            } else {
              self!.feedback = true;
              self!.obj!.copyFrom(obj2);
              self!.feedback = false;
            }
            return nil
          })
        ]))
      */},
    },
    {
      name: 'onRemove',
      code: function() {
        // TODO
      },
      swiftCode: '// TODO',
    }
  ],
});
