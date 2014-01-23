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
 *    %%value(<whitespace>|<): output a single value to the template output
 *
 * TODO: add support for arguments
 */

var TemplateParser = {
  __proto__: grammar,

  START: sym('markup'),

  markup: repeat0(alt(
    sym('simple value'),
    sym('raw values tag'),
    sym('values tag'),
    sym('code tag'),
    sym('ignored newline'),
    sym('newline'),
    sym('single quote'),
    sym('text')
  )),

  'simple value': seq('%%', repeat(not(alt(' ','\n','<'), anyChar))),

  'raw values tag': alt(
    seq('<%=', repeat(not('%>', anyChar)), '%>'),
    seq('{{{', repeat(not('}}}', anyChar)), '}}}')
  ),

  'values tag': seq('{{', repeat(not('}}', anyChar)), '}}'),

  'code tag': seq('<%', repeat(not('%>', anyChar)), '%>'),
  'ignored newline': literal('\\\n'),
  newline: literal('\n'),
  'single quote': literal("'"),
  text: anyChar
};

var TemplateOutput = {
  create: function(obj) {
    var buf = '';
    var f = function(/* arguments */) {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        var o = arguments[i];
        buf += o.toHTML ? o.toHTML() : o;
        if ( o.initHTML && obj.addChild ) obj.addChild(o);
      }
    };

    f.toString = function() { return buf; };

    return f;
  }
};

var TemplateCompiler = {
  __proto__: TemplateParser,

  out: [],

  push: function() { this.out.push.apply(this.out, arguments); },

  header: 'var out = opt_out ? opt_out : TemplateOutput.create(this);' +
    "out('",

  footer: "');" +
    "return out.toString();"

}.addActions({
   markup: function (v) {
     var ret = this.header + this.out.join('') + this.footer;
     this.out = [];
     return ret;
   },
   'simple value': function(v) { this.push("', this.", v[1].join(''), ",'"); },
   'raw values tag': function (v) { this.push("',", v[1].join(''), ",'"); },
   'values tag': function (v) { this.push("',", AbstractView.getPrototype().strToHTML(v[1].join('')), ",'"); },
   'code tag': function (v) { this.push("');", v[1].join(''), "out('"); },
   'single quote': function () { this.push("\\'"); },
   newline: function () { this.push("\\n"); },
   text: function(v) { this.push(v); }
});


var TemplateUtil = {

   /** Create a method which only compiles the template when first used. **/
   lazyCompile: function(t) {
     var delegate;

     return function() {
       if ( ! delegate ) {
         delegate = TemplateUtil.compile(t.template);
       }

       return delegate.apply(this, arguments);
     };
   },

   compile: window.chrome && window.chrome.app && window.chrome.app.runtime ?
     function() {
       return function() {
         return "Models must be arequired()'ed for Templates to be compiled in Packaged Apps.";
       };
     } :
     function(str) {
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
