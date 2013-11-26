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

var TemplateParser = {
  __proto__: grammar,

  START: sym('markup'),

  markup: repeat0(alt(
    sym('values tag'),
    sym('code tag'),
    sym('ignored newline'),
    sym('newline'),
    sym('single quote'),
    sym('text')
  )),

  'values tag': seq('<%=', repeat(not('%>', anyChar)), '%>'),
  'code tag': seq('<%', repeat(not('%>', anyChar)), '%>'),
  'ignored newline': literal('\\\n'),
  newline: literal('\n'),
  'single quote': literal("'"),
  text: anyChar
};

var TemplateCompiler = {
  __proto__: TemplateParser,

  out: [],

  push: function() { this.out.push.apply(this.out, arguments); },

  header: "var out;" +
    "if ( opt_out ) { out = opt_out; } else { var buf = []; out = buf.push.bind(buf); }\n" +
    "out('",

  footer: "');" +
    "if ( ! opt_out ) return buf.join('');"

}.addActions({
   markup: function (v) {
     var ret = this.header + this.out.join('') + this.footer;
     this.out = [];
     return ret;
   },
   'values tag': function (v) { this.push("',", v[1].join(''), ",'"); },
   'code tag': function (v) { this.push("');", v[1].join(''), "out('"); },
   'single quote': function () { this.push("\\'"); },
   newline: function () { this.push("\\n"); },
   text: function(v) { this.push(v); }
});


var TemplateUtil = {

   compile: window.chrome && window.chrome.app && window.chrome.app.runtime ?
     function() {
       return function() {
         return "Models must be arequired()'ed for Templates to be compiled in Packaged Apps.";
       };
     } :
     function(str) {

       // TODO: eval hack for PackagedApps
       var code = TemplateCompiler.parseString(str);

       try {
         return new Function("opt_out", code);
       } catch (err) {
         console.log("Template Error: ", err);
         console.log(code);
         return function() {};
       }
     },

   /**
    * Combinator which takes a template which expects an output parameter and
    * converts it into a function which returns a string.
    */
   stringifyTemplate: function (template) {
      return function() {
         var buf = [];

         this.output(buf.push.bind(buf), obj);

         return buf.join('');
      };
   }
};
