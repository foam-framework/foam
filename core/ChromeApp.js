/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

/** Code Specific to Chrome Apps. **/

ajsonp = function(url, params, opt_method) {
  return axhr(url, opt_method ? opt_method : 'GET', params);
};

CLASS({
  name: 'ChromeAuthAgent',
  label: 'ChromeAuthAgent',

  properties: [
    {
      type: 'String',
      name: 'accessToken'
    }
  ],

  listeners: {
    refresh: function(ret) {
      var self = this;
      chrome.identity.getAuthToken(
        { interactive: true },
        function(t) {
          if ( t && self.accessToken === t ) {
            chrome.identity.removeCachedAuthToken(
              { token: self.accessToken },
              function() {
                chrome.identity.getAuthToken(
                  { interactive: true },
                  function(t) {
                    self.accessToken = t;
                    ret && ret(t);
                  });
              });
          } else {
            self.accessToken = t;
            ret && ret(t);
          }
        });
    }
  }
});

function asendjson(path) {
  return function(ret, msg) {
    var data = JSONUtil.compact.stringify(msg);
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("POST", path);
    aseq(
      function(ret) {
        xhr.asend(ret, data);
      },
      function(ret, resp) {
        resp = JSONUtil.parse(X, resp);
        ret(resp);
      })(ret);
  };
}

// The default implementation uses eval(), which isn't supported in Chrome Apps.
JSONUtil.parseToMap = function(str) {
  return JSON.parse(str);
};

// TODO: I would rather have the default semantics be to open a window and then have that
// revert to a stack in situations where it is necessary.
var stack = {
  openWindow: function(view, width, height, opt_cb) {
     var self = this;
     chrome.app.window.create('empty.html', {width: width, height: height}, function(w) {
       w.contentWindow.onload = function() {
         self.window = w.contentWindow;
         $addWindow(w.contentWindow);
         view.window = w.contentWindow;
         self.window.document.body.innerHTML = view.toHTML();
         view.initHTML();
         w.focus();
         opt_cb && opt_cb(self.window);
       };
       w.onClosed.addListener(function() {
         console.log('onClosed');
         $removeWindow(w.contentWindow);
       });
     });
  },
  pushView: function(view, name, cb) {
     // this.window = window.open('','','width=700,height=600');
     this.openWindow(view, 900, 800, cb);
  },
  back: function() {
    this.window.close();
    this.window = undefined;
  },
  setPreview: function() {
    /* nop */
  }
};


var IS_CHROME_APP = true;

function subDocument(d) {
  d.writeln = function(str) {
    this.body.insertAdjacentHTML('beforeend', str);
  };

  return d;
};

subDocument(document);
