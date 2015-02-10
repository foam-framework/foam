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
  name: 'JSONFileDAO',
  package: 'foam.core.dao',
  extendsModel: 'AbstractFileDAO',

  label: 'JSON File DAO',

  properties: [
    {
      name:  'writeQueue',
      type:  'Array[String]',
      defaultValueFn: function() {
        return [];
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.withWriter((function(writer) {
        writer.addEventListener(
          'writeend',
          (function(e) {
            this.writeOne_(e.target);
          }).bind(this));
      }).bind(this));
    },

    readFile_: function(reader, file) {
      reader.readAsText(file);
    },

    parseContents_: function(ret, contents, storage) {
      with (storage) { eval(contents); }
      ret(storage);
    },

    writeOne_: function(writer) {
      if ( writer.readyState == 1 ) return;
      if ( this.writeQueue.length == 0 ) return;

      writer.seek(writer.length);
      var queue = this.writeQueue;
      var blob = queue.shift();
      this.writeQueue = queue;
      writer.write(blob);
    },

    update_: function(mutation, obj) {
      var parts = [];

      if (mutation === 'put') {
        parts.push("put(" + JSONUtil.compact.stringify(obj) + ");\n");
      } else if (mutation === 'remove') {
        parts.push("remove(" + JSONUtil.compact.stringify(obj.id) + ");\n");
      }

      this.writeQueue = this.writeQueue.concat(new Blob(parts));

      this.withWriter((function(writer) {
        this.writeOne_(writer);
      }).bind(this));
    }
  }
});
