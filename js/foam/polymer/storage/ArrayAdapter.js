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
  package: 'foam.polymer.storage',
  name: 'ArrayAdapter',
  documentation: function() {/*
    <p>This adapter connects an array of Polymer objects <tt>this.target[this.key]</tt>
    with a DAO.</p>

    <p>$$DOC{ref:".onChange"} should be called by the Polymer component, usually
    <tt>polymer/foam-storage.html</tt> or similar, whenever the array changes
    on the Polymer side.</p>

    <p>This adapter creates a GUID for each object in the array. On the FOAM side,
    this is obj.id. On the Polymer side, it's stored in <tt>obj.__foam_id</tt>.
    If the Polymer side is recreating objects intended to be the same, they will
    be duplicated, unless that ID is preserved.</p>

    <p>Feedback is prevented by only updating the Polymer object on a put if the
    diff() is nonempty.</p>
  */},
  properties: [
    'target',
    'key',
    'dao',
  ],

  constants: {
    FOAM_ID: '__foam_id'
  },

  methods: [
    function onChange(e) {
      if (e && e.path === 'value.splices') {
        // Array-level changes.
        var splices = e.value;
        // Otherwise, skim the indexSplices for the changes.
        for (var s = 0; s < splices.indexSplices.length; s++) {
          var splice = splices.indexSplices[s];
          // Check the removed array.
          if (splice.removed && splice.removed.length) {
            for (var i = 0; i < splice.removed.length; i++) {
              this.dao.remove(splice.removed[i][this.FOAM_ID]);
            }
          }

          // And then the added count.
          if (splice.addedCount > 0) {
            splice.object.forEach(this.doPut.bind(this));
          }
        }
      } else if (e && e.path.indexOf('value.#') === 0) {
        // Single-element changes.
        // Split the message, eg. value.#12.foobar.baz into 12
        var index = +(e.path.split('.')[1].substring(1));
        this.doPut(e.base[index]);
      } else if (e && e.path === 'value.length') {
        // Do nothing.
      } else if (e && e.path === 'value') {
        // Completely replacing the array.
        // There's no way to know the original array, so we'll have to play
        // removeAll games.
        var id = this.FOAM_ID;
        this.dao.where(NOT(IN(this.dao.model.ID, e.value.map(function(x) { return x[id]; })))).select([])(function(missing) {
          for (var i = 0; i < missing.length; i++) {
            this.dao.remove(missing[i].id);
          }

          for (var i = 0; i < e.value.length; i++) {
            this.doPut(e.value[i]);
          }
        }.bind(this));
      }
    },

    function doPut(obj) {
      // Given a Polymer object, upgrade it to a FOAM object and put() it.
      var item = this.dao.model.create(obj, X);
      if (!obj[this.FOAM_ID]) obj[this.FOAM_ID] = createGUID();
      item.id = obj[this.FOAM_ID];
      this.dao.put(item);
    },

    function put(obj) {
      // Check if this is an update to an existing object.
      var a = this.target[this.key];
      for (var i = 0; i < a.length; i++) {
        if (a[i][this.FOAM_ID] === obj.id) {
          var diff = obj.diff(a[i]);
          delete diff.id;
          if (Object.keys(diff).length) {
            this.target.set([this.key, i], obj);
          }
          return;
        }
      }
      var clone = obj.clone();
      clone[this.FOAM_ID] = obj.id;
      this.target.push(this.key, clone);
    },
    function remove(obj) {
      var a = this.target[this.key];
      for (var i = 0; i < a.length; i++) {
        if (obj.id === a[i][this.FOAM_ID]) {
          this.target.splice(this.key, i, 1);
          return;
        }
      }
    },
    function reset() {
      this.dao.select([])(function(array) {
        this.target[this.key] = array;
      }.bind(this));
    }
  ]
});
