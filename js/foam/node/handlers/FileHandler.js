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
  package: 'foam.node.handlers',
  name: 'FileHandler',
  extends: 'foam.node.handlers.Handler',
  properties: [
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'path',
      hidden: true,
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'fs',
      hidden: true,
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'url',
      hidden: true,
    },
    {
      name: 'pathname'
    },
    {
      name: 'file'
    }
  ],
  methods: {
    handle: function(req, res) {
      if ( this.url.parse(req.url).pathname !== this.pathname ) return false;

      this.fs.readFile(this.file, function(err, data) {
	if ( err ) {
	  this.send(res, 404, 'File not found.');
	} else {
	  this.send(res, 200, data.toString());
        }
      }.bind(this));

      return true;
    }
  }
});
