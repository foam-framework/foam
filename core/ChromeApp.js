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

var __EVAL_CALLBACKS__ = {};
var aeval = (function() {
  var nextID = 0;

  return function(src) {
    return function(ret) {
      var id = 'c' + (nextID++);

      var newjs = ['__EVAL_CALLBACKS__["' + id + '"](' + src + ');'];
      var blob  = new Blob(newjs, {type: 'text/javascript'});
      var url   = window.URL.createObjectURL(blob);

      __EVAL_CALLBACKS__[id] = function(data) {
        delete __EVAL_CALLBACKS__[id];

        ret && ret.call(this, data);
      };

      var script = document.createElement('script');
      script.src = url;
      script.onload = function() {
        this.remove();
        window.URL.revokeObjectURL(url);
//        document.body.removeChild(this);
      };
      document.body.appendChild(script);
    };
  };
})();

var aevalTemplate = function(t) {
  if ( t.template ) {
    return aeval('function (opt_out) {' + TemplateCompiler.parseString(t.template) + '}');
  }

  return aseq(
    t.futureTemplate,
    function(ret, template) {
      aeval('function (opt_out) {' + TemplateCompiler.parseString(template) + '}')(ret);
    });
};


function arequire(modelName) {
  var model = GLOBAL[modelName];

  /** This is so that if the model is arequire'd concurrently the
   *  initialization isn't done more than once.
   **/
  if ( ! model.required__ ) {
    // TODO: eventually this should just call the arequire() method on the Model
    var args = [];
    for ( var i = 0 ; i < model.templates.length ; i++ ) {
      var t = model.templates[i];
      args.push(aseq(
        aevalTemplate(model.templates[i]),
        (function(t) { return function(ret, m) {
          model.getPrototype()[t.name] = m;
          ret();
        };})(t)
      ));
    }

    model.required__ = amemo(aseq(
      apar.apply(apar, args),
      aconstant(model)));
  }

  return model.required__;
}


ajsonp = function(url, params, opt_method) {
  return axhr(url, opt_method ? opt_method : 'GET', params);
};

var OAuthXhr = {
  create: function(xhr, responsetype, agent) {
    xhr.responseType = responsetype;
    return {
      __proto__: this,
      xhr: xhr,
      agent: agent
    };
  },

  set responseType(type) {
    this.xhr.responseType = type;
  },
  get responseType() {
    return this.xhr.responseType;
  },

  asend: function(ret, method, url, payload) {
    var self = this;
    var finished = false;
    var attempts = 0;
    awhile(
      function() { return !finished; },
      aseq(
        function(ret) {
          self.xhr.open(method, url);
          self.xhr.setRequestHeader('Authorization', 'Bearer ' + self.agent.accessToken);
          // TODO: This should be added by a decorator, or via a parameter.
          self.xhr.setRequestHeader("Content-Type", "application/json");
          self.xhr.asend(ret, payload);
        },
        function(ret) {
          if (self.xhr.status == 401 || self.xhr.status == 403) {
            if (attempts >= 2) {
              finished = true;
              ret();
              return;
            }
            attempts++;
            self.agent.refresh(ret);
            return;
          }
          finished = true;
          ret(self.xhr.response, self.xhr.status);
        }))(ret);
  }
};

var OAuthXhrFactory = FOAM({
  model_: 'Model',

  name: 'OAuthXhrFactory',
  label: 'OAuthXhrFactory',

  properties: [
    {
      name: 'authAgent',
      type: 'ChromeAuthAgent',
      required: true
    },
    {
      model_: 'StringProperty',
      name: 'responseType'
    }
  ],

  methods: {
    make: function() {
      return OAuthXhr.create(new XMLHttpRequest(), this.responseType, this.authAgent);
    }
  }
});

var ChromeAuthAgent = FOAM({
  model_: 'Model',
  name: 'ChromeAuthAgent',
  label: 'ChromeAuthAgent',

  properties: [
    {
      model_: 'StringProperty',
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
        resp = FOAM(resp);
        ret(resp);
      })(ret);
  };
};

// The default implementation uses eval(), which isn't supported in Chrome Apps.
JSONUtil.parseToMap = function(str) {
  return JSON.parse(str);
};

var stack = {
  openWindow: function(view, width, height, opt_cb) {
     var self = this;
     chrome.app.window.create('empty.html', {width: width, height: height}, function(w) {
       w.contentWindow.onload = function() {
         self.window = w.contentWindow;
         $addWindow(w.contentWindow);
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
