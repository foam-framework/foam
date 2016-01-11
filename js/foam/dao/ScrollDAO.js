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
  package: 'foam.dao',
  name: 'ScrollDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'MDAO'
  ],
  properties: [
    {
      name: 'src',
      required: true,
      postSet: function(old, src) {
        old && old.unlisten(this.onScroll);
        src.listen(this.onScroll);
        this.delegate = this.MDAO.create({
          model: src.model || this.model
        });
      }
    },
    {
      type: 'Int',
      name: 'scrollValue',
      defaultValue: 0,
      postSet: function() {
        this.onScroll();
      }
    },
    {
      type: 'Int',
      name: 'scrollSize',
      defaultValue: 10,
      postSet: function() {
        this.onScroll();
      }
    }
  ],
  listeners: [
    {
      name: 'onScroll',
      code: function() {
        var dao = this.src.skip(this.scrollValue);
        if ( this.scrollSize )
          dao = dao.limit(this.scrollSize);

        dao.select()(function(objs) {
            var keys = [];
            var pk = this.model.getProperty(this.model.ids[0]);
            for ( var i = 0 ; i < objs.length ; i++ ) {
              keys.push(objs[i].id);
              this.delegate.put(objs[i]);
            }
            this.delegate.where(NOT(IN(pk, keys))).removeAll();
          }.bind(this));
      }
    }
  ]
});
