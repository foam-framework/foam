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
  package: 'foam.u2.md',
  name: 'DAOListView',
  extends: 'foam.u2.DAOListView',

  methods: [
    function initE() {
      this.cls(this.myCls());
    }
  ],
  listeners: [
    {
      name: 'onDAOPut',
      code: function(obj) {
        if ( this.rows[obj.id] ) {
          this.rows[obj.id].data = obj;
          return;
        }

        var child = obj.toE ?
            obj.toE(this.Y) :
            obj.toRowE ? obj.toRowE(this.Y) :
            this.DetailView.create({ data: obj });

        child.style({
          'transition': 'transform 300ms ease, max-height 600ms ease-in',
          'transform': 'translate3d(-600px,0,0)'
          //'max-height': '0px' // slow!
        });
        this.X.setTimeout(function() { child.style({
          'transition': 'transform 300ms ease, max-height 600ms ease-in',
          'transform': 'translate3d(0,0,0)'
          //'max-height': '300px'
          });
        }, 100);

        child.on('click', function() {
          if ( this.rows[obj.id] ) { // don't respond when animating out
            this.publish(this.ROW_CLICK, obj);
          }
        }.bind(this));

        this.rows[obj.id] = child;
        this.add(child);
      }
    },
    {
      name: 'onDAORemove',
      code: function(obj) {
        var child = this.rows[obj.id];
        if ( child ) {
          child.style({
            'transition': 'transform 300ms ease, max-height 600ms ease-in',
            'transform': 'translate3d(-600px,0,0)'
            //'max-height': '0px'
          });
          delete this.rows[obj.id];
          this.X.setTimeout(function() {
            this.removeChild(child);
          }.bind(this), 500);
        }
      }
    }
  ]
});
