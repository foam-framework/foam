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


// Asynchronous eval workaround for lack of eval in Chrome Apps. Do not add
// workaround in Cordova Chrome Apps.
if ( ! (window.cordova && window.chrome) ) {
  TemplateUtil.compile = function() {
    return function() {
      return this.name_ + " wasn't required.  Models must be arequired()'ed for Templates to be compiled in Packaged Apps.";
    };
  };

  var __EVAL_CALLBACKS__ = {};
  var aeval = (function() {
    var nextID = 0;

    var future = afuture();
    if ( ! document.body )
      window.addEventListener('load', future.set);
    else
      future.set();

    return function(src) {
      return aseq(
          future.get,
          function(ret) {
            var id = 'c' + (nextID++);

            var newjs = ['__EVAL_CALLBACKS__["' + id + '"](' + src + ');'];
            var blob  = new Blob(newjs, {type: 'text/javascript'});
            var url   = window.URL.createObjectURL(blob);

            // TODO: best values?
            // url.defer = ?;
            // url.async = ?;

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
          });
    };
  })();

  var TEMPLATE_FUNCTIONS = [];

  var aevalTemplate = function(t, model) {
    var doEval_ = function(t) {
      // Parse result: [isSimple, maybeCode]: [true, null] or [false, codeString].
      var parseResult = TemplateCompiler.parseString(t.template);

      // Simple case, just a string literal
      if ( parseResult[0] )
        return aconstant(ConstantTemplate(t.language === 'css' ?
            X.foam.grammars.CSSDecl.create().parser.parseString(t.template) :
            t.template));

      var code = TemplateUtil.HEADER + parseResult[1] + TemplateUtil.FOOTERS[t.language];

      var args = ['opt_out'];
      if ( t.args ) {
        for ( var i = 0 ; i < t.args.length ; i++ ) {
          args.push(t.args[i].name);
        }
      }
      return aeval('function(' + args.join(',') + '){' + code + '}');
    };
    var doEval = function(t) {
      try {
        return doEval_(t);
      } catch (err) {
        console.log('Template Error: ', err);
        console.log(code);
        return aconstant(function() {return 'TemplateError: Check console.';});
      }
    };

    var i = TEMPLATE_FUNCTIONS.length;
    TEMPLATE_FUNCTIONS[i] = '';
    return aseq(
        t.futureTemplate,
        function(ret, t) { doEval(t)(ret); },
        function(ret, f) {
          TEMPLATE_FUNCTIONS[i] = f;
          ret(f);
        });
  };
}
