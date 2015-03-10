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
    find: function (key, sink) {
      var X = this.X;
      var model = X.lookup(key);
      if ( model ) {
        sink && sink.put && sink.put(model);
        return;
      }
      //if (! X.NAME) console.log("MFD X: ", X.NAME, X.$UID, key);

      var sourcePath = window.FOAM_BOOT_DIR + '../js/' + key.replace(/\./g, '/') + '.js';
      
      var tag = X.document.createElement('script');
      tag.src = sourcePath;
      X.document.head.appendChild(tag);
      
      tag.onload = function() {
        var model = X.lookup(key);
        if ( ! model ) {
          console.warn('Model load failed for: ', key);
          sink && sink.error && sink.error('Model load failed for: ', key);
          return;
        }
        sink && sink.put && sink.put(model);
      }.bind(this.X.document.head);
    },
    
    select: function(sink) {
      // parse directory listing, if available
      var sourcePath = window.FOAM_BOOT_DIR + '../js';
      this.scrapeDirectory(sourcePath, "", sink);
    },
    
    scrapeDirectory: function(dir, pkg, sink) {
      var request = new XMLHttpRequest();
      request.open("GET", dir);
      request.addEventListener("readystatechange", function(e) {
        if (request.readyState === 4) {
          // find javascript files
          var fre = /.*?(?:href=\")(.*?).js\".*?/gmi;
          fre.sticky = true;
          var files = [];
          var fmatch;
          do {
            if ( fmatch = fre.exec(request.response) ) files.push(fmatch[1]);
          } while ( fmatch );
          files.forEach(function(d) {
            //find(pkg ? pkg+"."+d : d, sink);
            //console.log("areqX ", this.X.NAME);
            this.find(pkg ? pkg+"."+d : d, sink);
          }.bind(this));         

          // find subdirectories
          var re = /.*?(?:href=\")(.*?)\/\".*?/gm;
          re.sticky = true;
          var dirs = [];
          var match;
          do {
            if ( match = re.exec(request.response) ) dirs.push(match[1]);
          } while ( match );
          dirs.forEach(function(d) {
            this.scrapeDirectory(dir + '/' + d, pkg ? pkg+"."+d : d, sink);
          }.bind(this));
        }
      }.bind(this));
      request.send();           
    }
  }
});

X.ModelDAO = X.foam.core.bootstrap.ModelFileDAO.create();
