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
  name: 'FilesAPI',
  requires: [
    'com.google.drive.File',
    'XHR'
  ],
  properties: [
    {
      name: 'baseUri',
      defaultValue: 'https://www.googleapis.com/'
    },
    {
      name: 'metadataUri',
      defaultValueFn: function() {
        return this.baseUri + 'drive/v2'
      },
    },
    {
      name: 'uploadUri',
      defaultValueFn: function() {
        return this.baseUri + 'upload/drive/v2'
      }
    },
  ],
  methods: [
    function list(ret, query) {
      var self = this;
      self.XHR.create().asend(
        function(data) {
          ret(JSON.parse(data));
        },
        self.metadataUri + '/files?q=' + query);
    },
    function get(ret, id) {
      var self = this;
      aseq(
        function(ret) {
          self.XHR.create().asend(
            ret,
            self.metadataUri + '/files/' + id)
        },
        function(ret, data) {
          if ( data ) {
            data = JSON.parse(data);
            var file = self.File.create(data);
          }
          ret(file);
        })(ret);
    },
    function download(ret, id) {
      var self = this;
      self.XHR.create().asend(
        ret,
        self.metadataUri + '/files/' + id + '?alt=media')
    },
    function upload(ret, file) {
      var self = this;
      aseq(
        function(ret) {
          var uri = self.metadataUri + '/files';
          var method = "POST"

          if ( file.id ) {
            method = "PUT";
            uri += '/' + file.id;
          }

          var metadata = {
            title: file.title,
            mimeType: file.mimeType
          };

          if ( file.parent ) {
            metadata.parents = [
              {
                id: file.parent,
              }
            ];
          }

          self.XHR.create().asend(
            ret,
            uri,
            JSON.stringify(metadata),
            method
          )
        },
        function(ret, data, _, success) {
          if ( ! data || ! success) {
            return;
          }

          data = JSON.parse(data);

          if ( file.contents.length > 0 ) {
            self.XHR.create().asend(
              function(resp) {
                if ( resp ) {
                  ret(data);
                  return;
                }
                ret();
              },
              self.uploadUri + '/files/' + data.id + '?uploadType=media',
              file.contents,
              "PUT")
          } else {
            ret(data);
          }
        })(ret);
    },
    function remove(ret, id) {
      this.XHR.create().asend(
        ret,
        this.metadataUri + '/files/' + id,
        undefined,
        "DELETE");
    },
    function copy(ret, id) {
      this.XHR.create().asend(
        ret,
        this.metadataUri + '/files/' + id + '/copy',
        undefined,
        "POST");
    }
  ]
})
