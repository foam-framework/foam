/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'com.google.inno',
  name: 'MessageListView',
  extends: 'foam.u2.View',
  requires: [
    'com.google.inno.Message',
    'foam.u2.DAOListView'
  ],
  imports: [
    'name$',
    'bucket$',
    'data'
  ],
  properties: [
    {
      name: 'input',
      type: 'String',
      postSet: function(_, s) {
        if ( this.input != '' ) {
          this.data.put(
            this.Message.create({
              from: this.name,
              content: s,
              bucket: this.bucket
            })
          );
          this.input = '';
        }
      }
    },
    {
      name: 'order',
      adapt: function(_, a) { return toCompare(a); },
      lazyFactory: function() {
        return this.Message.TIMESTAMP
      }
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old ) {
          old.unlisten(this);
        }
        this.reset();
        nu.pipe(this);
      }
    },
    {
      name: 'body_',
      factory: function() {
        return this.X.E('div');
      }
    },
    {
      name: 'rows',
      factory: function() { return {}; }
    },
    {
      name: 'objs',
      factory: function() { return []; }
    }
  ],
  methods: [
    function init() {
      this.data.pipe(this);
    },
    function put(msg) {
      this.remove(msg);

      for ( var i = 0 ; i < this.objs.length ; i++ ) {
        var child = this.objs[i];

        if ( this.order(msg, child) < 0 ) {
          break;
        }
      }


      this.rows[msg.id] = msg.toRowE(this.Y);

      if ( i === this.body_.children.length ) {
        this.objs.push(msg);
        this.body_.add(this.rows[msg.id]);
        return;
      }

      this.objs.splice(i, 0, msg);
      this.body_.insertBefore(this.rows[msg.id], this.rows[child.id]);
    },
    function remove(msg) {
      for ( var i = 0 ; i < this.objs.length ; i++ ) {
        var child = this.objs[i];
        if ( equals(child.id, msg.id) ) {
          this.objs.splice(i, 1);
          this.body_.removeChild(this.rows[child.id]);
          delete this.rows[child.id];
          return;
        }
      }
    },
    function reset(msg) {
      this.body_.removeAllChildren();
    },
    function initE() {
      this.add(this.body_)
        .start('div')
        .x({ data: this })
        .add(this.INPUT)
        .end()
    },
  ]
});
