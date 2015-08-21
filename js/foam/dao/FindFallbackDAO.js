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


CLASS({
  package: 'foam.dao',
  name: 'FindFallbackDAO',

  extendsModel: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'fallback'
    }
  ],

  methods: {
    find: function(id, sink) {
      var sid = ""+id;
      //console.log("FFD find: ", sid);
      this.delegate.find(sid, {
         put: function(o) {
           //console.log("FFD found primary: ", sid);
           this.delegate.put(o);
           sink && sink.put && sink.put(o);
         }.bind(this),
         error: function() {
           if ( ! this.fallback ) {
             //console.log("FFD primary fail, no fallback: ", sid);
             sink && sink.error && sink.error();
           } else {
             var fid = ""+sid;
             //console.log("FFD fallback find: ", fid);
             this.fallback.find(fid, {
               put: function(o) {
                //console.log("FFD fallback found: ", fid);
                this.delegate.put(o);
                sink && sink.put && sink.put(o);
               }.bind(this),
               error: function() {
                 //console.log("FFD fallback not found: ", fid);
                 sink && sink.error && sink.error();
               }.bind(this)
             });
           }
         }.bind(this)
      });
    }
  }
});
