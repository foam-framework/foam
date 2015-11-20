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
  package: 'com.google.ow.dao',
  name: 'VideoOffloadDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'Specialized PropertyOffloadDAO that knows how to reach ' +
      'into $$DOC{ref:"com.google.ow.content.Video", plural: true} and ' +
      'offload the cached video data to a separate IDBDAO.',
  requires: [
    'com.google.ow.content.Video',
    'foam.dao.IDBDAO',
  ],

  properties: [
    {
      name: 'offloadDAO',
      factory: function() {
        return this.IDBDAO.create({
          model: this.Video,
          name: 'com.google.ow.content.VideoCache',
        });
      }
    },
  ],

  methods: [
    function put(obj, sink) {
      if (this.Video.isInstance(obj.data) && obj.data.cache_) {
        var offload = this.Video.create({ id: obj.data.id });
        offload.cache_ = obj.data.cache_;
        obj.data.clearProperty('cache_');
        this.offloadDAO.put(offload);
      }
      this.delegate.put(obj, sink);
    },

    function find(id, sink) {
      var self = this;
      var mysink = {
        __proto__: sink,
        put: function(obj) {
          //sink.put && sink.put.apply(sink, arguments);
          self.offloadDAO.find(obj.data.id, {
            put: function(offload) {
              if (offload.cache_) {
                obj.data.cache_ = offload.cache_;
              }
              sink.put(obj);
            },
            error: function() {
              sink.put(obj);
            }
          });
        }
      };

      this.delegate.find(id, mysink);
    },
  ]
});
