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

MODEL({
  name: 'ModelFileDAO',
  package: 'node.dao',

  properties: [
    {
      name: 'classpath',
      factory: function() {
        return global.NODE_CLASSPATH ||
            (global.FOAM_BOOT_DIR + '/../js');
      }
    }
  ],

  methods: {
    find: function (key, sink) {
      var X = this.X;
      try {
        var model = X.lookup(key);
        if ( model ) {
          sink && sink.put && sink.put(model);
          return;
        }

        var fileName = this.classpath + '/' + key.replace(/\./g, '/') + '.js';
        require(fileName);

        model = X.lookup(key);
        if ( ! model ) {
          sink && sink.error && sink.error('Model load failed for: ', key);
          return;
        }
        sink && sink.put && sink.put(model);
      } catch(e) {
        sink && sink.error && sink.error(e);
      }
    }
  }
});

X.ModelDAO = X.node.dao.ModelFileDAO.create();
