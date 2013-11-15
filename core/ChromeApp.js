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
/**
 * Simple template system modelled after JSP's.
 *
 * Syntax:
 *    <% code %>: code inserted into template, but nothing implicitly output
 *    <%= comma-separated-values %>: all values are appended to template output
 *    \<new-line>: ignored
 *    %value<whitespace>: TODO: output a single value to the template output
 *
 * TODO: add support for arguments
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
//        document.body.removeChild(this);
      };
      document.body.appendChild(script);
    };
  };
})();

var aevalTemplate = function(t) {
  return aeval('function (opt_out) {' + TemplateCompiler.parseString(t.template) + '}');
};


function arequire(modelName) {
  var model = GLOBAL[modelName];

  if ( model.required__ ) { return aconstant(model); }
  // TODO: eventually this should just call the arequire() method on the Model
  var args = [];
  for ( var i = 0 ; i < model.templates.length ; i++ ) {
    var t = model.templates[i];
    args.push(aseq(
       aevalTemplate(model.templates[i]),
       (function(t) { return function(ret, m) {
         model.getPrototype()[t.name] = m;
         ret();
       }})(t)
    ));
  }

  model.required__ = true;

  return aseq(apar.apply(apar, args), aconstant(model));
}

function axhr(url, opt_op, opt_params) {
  var op = opt_op || "GET";
  var params = opt_params || [];

  return function(ret) {
    var xhr = new XMLHttpRequest();
    xhr.open(op, url);
    xhr.asend(ret, params.join('&'));
  };
}


function ajsonp(url, params) {
  return axhr(url, 'GET', params);
};

