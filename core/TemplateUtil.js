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
 *    <%# expression %>: dynamic (auto-updating) expression is output
 *    \<new-line>: ignored
 *    %%value(<whitespace>|<): output a single value to the template output
 *    $$feature(<whitespace>|<): output the View or Action for the current Value
 *
 * TODO: add support for arguments
 */

var TemplateParser = {
  __proto__: grammar,

  START: sym('markup'),

  markup: repeat0(alt(
    sym('create child'),
    sym('simple value'),
    sym('live value tag'),
    sym('raw values tag'),
    sym('values tag'),
    sym('code tag'),
    sym('ignored newline'),
    sym('newline'),
    sym('single quote'),
    sym('text')
  )),

  'create child': seq('$$', repeat(notChars(' $\n<{')),
                      optional(JSONParser.export('objAsString'))),

  'simple value': seq('%%', repeat(notChars(' "\n<'))),

  'live value tag': seq('<%#', repeat(not('%>', anyChar)), '%>'),

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
  /**
   * obj - Parent object.  If objects are output and have an initHTML() method, then they
   * are added to the parent by calling obj.addChild().
   **/
  // TODO(kgr): redesign, I think this is actually broken.  If we call appendHTML() of
  // a sub-view then it will be added to the wrong parent.
  create: function(obj) {
    var buf = '';
    var f = function(/* arguments */) {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        var o = arguments[i];
        if ( o && o.toView_ ) o = o.toView_();
        if ( ! ( o === null || o === undefined ) ) {
          if ( o.appendHTML ) {
            o.appendHTML(this);
          } else if ( o.toHTML ) {
            buf += o.toHTML();
          } else {
            buf += o;
          }
          if ( o.initHTML && obj.addChild ) obj.addChild(o);
        }
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

  header: 'var self = this; var X = this.X; var escapeHTML = View.getPrototype().strToHTML; var out = opt_out ? opt_out : TemplateOutput.create(this);' +
    "out('",

  footer: "');" +
    "return out.toString();"

}.addActions({
   markup: function (v) {
     var ret = this.header + this.out.join('') + this.footer;
     this.out = [];
     return ret;
   },
   'create child': function(v) {
     var name = v[1].join('').constantize();
     this.push("', self.createTemplateView('", name, "'",
               v[2] ? ', ' + v[2] : '',
               "),\n'");
   },
   'simple value': function(v) { this.push("',\n self.", v[1].join(''), ",\n'"); },
   'raw values tag': function (v) { this.push("',\n", v[1].join(''), ",\n'"); },
   'values tag': function (v) { this.push("',\nescapeHTML(", v[1].join(''), "),\n'"); },
   'live value tag': function (v) { this.push("',\nself.dynamicTag('span', function() { return ", v[1].join(''), "; }.bind(this)),\n'"); },
   'code tag': function (v) { this.push("');\n", v[1].join(''), ";out('"); },
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
         if ( ! t.template )
           throw 'Must arequire() template model before use for ' + this.TYPE + '.' + t.name;
         delegate = TemplateUtil.compile(Template.isInstance(t) ? t : Template.create(t));
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
     function(t) {
       var code = TemplateCompiler.parseString(t.template);

       try {
         var args = ['opt_out'];
         for ( var i = 0 ; i < t.args.length ; i++ ) {
           args.push(t.args[i].name);
         }
         args.push(code);
         return Function.apply(null, args);
       } catch (err) {
         console.log('Template Error: ', err);
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
   },

   // TODO: add docs to explain what this method does.
   templateMemberExpander: function(t, opt_X) {
     // Load templates from an external file
     // if their 'template' property isn't set
     var i = 0;
     var X = opt_X? opt_X : window.X;
     if ( typeof t === 'function' ) {
       t = docTemplate = X.Template.create({
         name: t.name,
         // ignore first argument, which should be 'opt_out'
         args: t.toString().match(/\((.*)\)/)[1].split(',').slice(1).filter(function(a) {
           return X.Arg.create({name: a});
         }),
         template: multiline(t)});
     } else if ( typeof t === 'string' ) {
       t = docTemplate = X.Template.create({
         name: 'body',
         template: t
       });
     } else if ( ! t.template ) {
       // console.log('loading: '+ this.name + ' ' + t.name);

       var future = afuture();
       var path = this.sourcePath;

       t.futureTemplate = future.get;
       path = path.substring(0, path.lastIndexOf('/')+1);
       path += this.name + '_' + t.name + '.ft';

       var xhr = new XMLHttpRequest();
       xhr.open("GET", path);
       xhr.asend(function(data) {
         t.template = data;
         future.set(X.Template.create(t));
         t.futureTemplate = undefined;
       });
     } else if ( typeof t.template === 'function' ) {
       t.template = multiline(t.template);
     }
     // TODO: do we need the case where you specify a Template def. with
     // .template = 'string'? Unify this with modelExpandTemplates.
     return t;
   },

   modelExpandTemplates: function(self, templates) {
     // Load templates from an external file
     // if their 'template' property isn't set
     var i = 0;
     templates.forEach(function(t) {
       if ( typeof t === 'function' ) {
         t = templates[i] = Template.create({
           name: t.name,
           // ignore first argument, which should be 'opt_out'
           args: t.toString().match(/\((.*?)\)/)[1].split(',').slice(1).map(function(a) {
             return Arg.create({name: a.trim()});
           }),
           template: multiline(t)});
       } else if ( ! t.template ) {
         // console.log('loading: '+ self.name + ' ' + t.name);

         var future = afuture();
         var path = this.sourcePath;

         t.futureTemplate = future.get;
         path = path.substring(0, path.lastIndexOf('/')+1);
         path += self.name + '_' + t.name + '.ft';

         var xhr = new XMLHttpRequest();
         xhr.open("GET", path);
         xhr.asend(function(data) {
           t.template = data;
           future.set(Template.create(t));
           t.futureTemplate = undefined;
         });
       } else if ( typeof t.template === 'function' ) {
         t.template = multiline(t.template);
       } else if (!t.template$) {
         // we haven't FOAMalized the template, and there's no crazy multiline functions.
         // Note that Model and boostrappy models must use this case, as Template is not
         // yet defined at bootstrap time. Use a Template object definition with a bare
         // string template body in those cases.
         if (typeof Template != "undefined")
           t = templates[i] = JSONUtil.mapToObj(self.X, t, Template);
         else
           t = templates[i] = JSONUtil.mapToObj(self.X, t); // safe for bootstrap, but won't do anything in that case.
       }
       i++;
     }.bind(self))
  }
};


/** Is actually synchronous but is replaced in ChromeApp with an async version. **/
var aeval = function(src) {
  return aconstant(eval('(' + src + ')'));
};


var aevalTemplate = function(t) {
  if ( t.template ) {
    return aeval('function (opt_out) {' + TemplateCompiler.parseString(t.template) + '}');
  }

  return aseq(
    t.futureTemplate,
    function(ret, t) {
      aeval('function (opt_out) {' + TemplateCompiler.parseString(t.template) + '}')(ret);
    });
};


