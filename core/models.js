/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

/**
 * Used when creating PersistentContext's.
 * Ex.
 * var persistentContext = PersistentContext.create({
 *  dao: IDBDAO.create({model: Binding}),
 *   predicate: NOT_TRANSIENT,
 *   context: GLOBAL
 *  });
 * ...
 * persistentContext.bindObject('userInfo', UserInfo, {});
 *
 * TODO: Make simpler to setup.
 **/
CLASS({
  name: 'Binding',

  documentation: function() {/*
      <p>Used when creating $$DOC{ref:'PersistentContext',usePlural:true}.</p>

      <p><code>var persistentContext = PersistentContext.create({<br/>
       dao: IDBDAO.create({model: Binding}),<br/>
        predicate: NOT_TRANSIENT,<br/>
        context: GLOBAL<br/>
       });<br/>
      ...<br/>
      persistentContext.bindObject('userInfo', UserInfo, {});<br/>
      </code></p>

    */},

  properties: [
    // TODO: add support for named sub-contexts
    {
      name:  'id',
      hidden: true
    },
    {
      name:  'value',
      hidden: true
    },
    {
      name: 'version',
      defaultValue: 1,
      hidden: true
    }
  ]
});


CLASS({
  name: 'PersistentContext',

  documentation: function() {/*
    <p>Persists a set of Objects. Despite the name, this has nothing to do with
    $$DOC{ref:'developerDocs.Context', text:'Contexts'}.</p>
  */},

  properties: [
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      hidden: true
    },
    {
      name:  'context',
      hidden: true
    },
    {
      name: 'predicate',
      type: 'Expr',
      defaultValueFn: function() { return TRUE; },
      hidden: true
    }
  ],

  methods: {

    manage: function(name, obj, version) {
      var write = EventService.merged((function() {
        // console.log('PersistentContext', 'updating', name);
        this.dao.put(this.Y.Binding.create({
          id:    name,
          value: JSONUtil.where(this.predicate).stringify(obj),
          version: version
        }));
      }).bind(this), undefined, this.Y);

      /*
       <p>Manage persistence for an object. Resave it in
       the DAO whenever it fires propertyChange events.</p>
       */
      obj.addListener(write);
      write();
    },
    bindObjects: function(a) {
      // TODO: implement
    },
    clearBinding: function(ret, name) {
      var self = this;
      self.dao.remove.ao(self.dao.find.bind(self.dao, name))(ret);
    },
    bindObject: function(name, factory, transientValues, version) {
      version = version || 1;
      // console.log('PersistentContext', 'binding', name);
      var future = afuture();
      transientValues = transientValues || {};

      if ( this.context[name] ) {
        future.set(this.context[name]);
      } else {
        var newinit = (function() {
          // console.log('PersistentContext', 'newInit', name);
          var obj = factory.create();
          obj.copyFrom(transientValues);
          this.context[name] = obj;
          this.manage(name, obj, version);
          future.set(obj);
        }).bind(this);

        this.dao.find(name, {
          put: function (binding) {
            if ( binding.version !== version ) {
              // console.log('PersistentContext', 'verison mismatch', name);
              newinit();
              return;
            }
            // console.log('PersistentContext', 'existingInit', name);
            //                  var obj = JSONUtil.parse(binding.value);
            //                  var obj = JSON.parse(binding.value);
            try {
              var json = JSON.parse(binding.value);
              var obj = JSONUtil.mapToObj(this.Y, json);
              obj.copyFrom(transientValues);
              this.context[name] = obj;
              this.manage(name, obj, version);
              future.set(obj);
            } catch(e) {
              console.log('PersistentContext', 'existingInit serialization error', name);
              newinit();
            }
          }.bind(this),
          error: newinit
        });
      }

      return future.get;
    }
  }
});


CLASS({
  name: 'UserInfo',
  label: 'UserInfo',

  properties: [
    {
      type: 'String',
      name: 'email'
    }
  ]
});
