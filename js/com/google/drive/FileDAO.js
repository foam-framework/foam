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
  package: 'com.google.drive',
  name: 'FileDAO',
  extends: 'AbstractDAO',
  requires: [
    'com.google.drive.FilesAPI',
    'com.google.drive.File'
  ],
  properties: [
    {
      name: 'model'
    },
    {
      name: 'filesApi',
      factory: function() { return this.FilesAPI.create(); }
    }
  ],
  methods: [
    function put(obj, sink) {
      var file = this.File.create({
        contents: obj.toJSON(),
        title: this.model.id + '-' + obj.id,
        parent: 'appfolder'
      });
      var self = this;

      aseq(
        function(ret) {
          self.filesApi.list(ret, "'appfolder' in parents and title contains '" + self.model.id + "-" + obj.id + "'");
        },
        function(ret, data) {
          if ( data && data.items && data.items.length ) {
            file.id = data.items[data.items.length-1].id;
          }
          self.filesApi.upload(ret, file);
        })(function(file) {
          sink && sink.put && sink.put(file);
        })
    },
    function afetch(id) {
      var self = this;
      return aseq(
        function(ret) {
          self.filesApi.download(ret, id);
        },
        function(ret, data) {
          aeval(data)(ret);
        },
        function(ret, json) {
          if ( ! json ) {
            sink && sink.error && sink.error();
            ret();
          }

          var obj = JSONUtil.mapToObj(self.Y, json, self.model)
          ret(obj);
        });
    },
    function find(id, sink) {
      var self = this;
      aseq(
        function(ret) {
          self.filesApi.list(
            ret,
            "'appfolder' in parents and title contains '" + self.model.id + "-" + id + "'")
        },
        function(ret, data) {
          if ( ! data || ! data.items || data.items.length < 1) {
            sink && sink.error && sink.error();
            return;
          }

          var chosen;
          for ( var i = 0 ; i < data.items.length ; i++ ) {
            var item = data.items[i]

            if ( ! chosen ) {
              chosen = item;
              continue;
            }

            var time = new Date(item.createdDate);
            if ( chosen.createdDate.compareTo(time) < 0) {
              chosen = item;
            }
          }
          self.afetch(chosen.id)(ret);
        })(
        function(obj) {
          if ( ! obj ) {
            sink && sink.error && sink.error(obj);
            return;
          }
          sink && sink.put && sink.put(obj);
        })
    },
    function select(sink, options) {
      var fut = afuture();
      sink = sink || [].sink;
      sink = this.decorateSink_(sink, options);
      var fc = this.createFlowControl_();

      var self = this;
      aseq(
        function(ret) {
          self.filesApi.list(ret, "'appfolder' in parents and title contains '" + self.model.id + "'");
        },
        function(ret, data) {
          if ( ! data || ! data.items ) {
            sink && sink.error && sink.error();
            return;
          }

          var fetches = [];
          var names = {};

          for ( var i = 0 ; i < data.items.length ; i++ ) {
            var item = data.items[i]

            if ( ! names[item.title] ) {
              names[item.title] = item;
              continue;
            }

            var time = new Date(item.createdDate);
            if ( (new Date(names[item.title].createdDate))
                 .compareTo(time) < 0) {
              names[item.title] = item;
            }
          }

          var keys = Object.keys(names);
          for ( var i = 0 ; i < keys.length ; i++ ) {
            (function(item) {
              fetches.push(
                aseq(
                  function(ret) {
                    if ( fc.stopped || fc.errorEvt ) return;
                    ret();
                    console.log("Fetching: ", item.title);
                  },
                  self.afetch(item.id),
                  function(ret, obj) {
                    console.log("Fetched:", obj.id);
                    if ( ! obj ) {
                      sink && sink.error && sink.error()
                      return;
                    }
                    sink && sink.put && sink.put(obj, null, fc);
                    ret();
                  })
                );
            })(names[keys[i]]);
          }
          apar.apply(null, fetches)(ret);
        })(function(){
          sink && sink.eof && sink.eof();
          fut.set(sink);
        });
      return fut.get;
    },
    function remove(obj, sink) {
      var self = this;
      aseq(
        function(ret) {
          self.filesApi.list(
            ret,
            "'appfolder' in parents and title contains '" + self.model.id + "-" + obj.id + "'");
        },
        function(ret, list) {
          if ( ! list || ! list.items.length ) {
            sink && sink.error && sink.error();
            return;
          }

          var funcs = [];
          for ( var i = 0 ; i < list.items.length ; i++ ) {
            (function(id) {
              funcs.push(
                function(ret) {
                  self.filesApi.remove(ret, id);
                });
            })(list.items[i].id);
          }
          aseq.apply(null, funcs)(ret);
        })(function() {
          sink && sink.remove && sink.remove(obj);
        });
    }
  ]
});
