/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  package: 'foam.core.bootstrap',
  methods: {  
    init: function() {
      this.SUPER();
      if ( ! this.X.modelFileDAO$RegisteredModels ) {
        this.X.set('modelFileDAO$RegisteredModels', {} );
      }
    },
    
    find: function (key, sink) {
      /* The find function will accumulate duplicate load attempts, chaining
      the given sinks together until the first onload completes. Subsequent
      load attempts will immediately put the item to the sink. */
      var X = this.X;
      var model = FOAM.lookup(key, X);
      if ( model ) {
        sink && sink.put && sink.put(model);
        return;
      }
      
      // If we've already seen this key, don't load it again
      if ( this.X.modelFileDAO$RegisteredModels[key] ) {
        var oldSink = this.X.modelFileDAO$RegisteredModels[key];
        // decorate the previous sink to chain it with the new one
        X.modelFileDAO$RegisteredModels[key] = {
          put: function(item) { 
            oldSink && oldSink.put && oldSink.put(item);
            sink && sink.put && sink.put(item);
          },
          error: function(item) { 
            oldSink && oldSink.error && oldSink.error(item);
            sink && sink.error && sink.error(item);
          }
        }
        return;
      }
      
      // It's a new key, so remember the sink and make a tag
      X.modelFileDAO$RegisteredModels[key] = sink;
      
      //var model = FOAM.lookup(key, X);
      var sourcePath = FOAM_BOOT_DIR + '../js/' + key.replace(/\./g, '/') + '.js';
      
      var tag = X.document.createElement('script');
      tag.src = sourcePath;
      X.document.head.appendChild(tag);

      tag.onload = function() {
        var itemSink = X.modelFileDAO$RegisteredModels[key];
        var model = FOAM.lookup(key, X);
        if ( ! model ) {
          console.warn('Model load failed for: ', key);
          itemSink && itemSink.error && itemSink.error('Model load failed for: ', key);
          return;
        }
        itemSink && itemSink.put && itemSink.put(model);
        // reset the sink we remembered, but don't undefine as we want to remember
        // the load is complete
        X.modelFileDAO$RegisteredModels[key] = { 
            put: function() { console.warn("Attempted put into already finished onload: ", key); },
            error: function() { console.warn("Attempted error into already finished onload: ", key); } 
          };
      }.bind(this.X.document.head);
    }
  }
});

X.ModelDAO = X.foam.core.bootstrap.ModelFileDAO.create();
