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
 */

var FOAMTagParser = {
  __proto__: grammar,

  create: function() {
    return {
      __proto__: this,
      html: HTMLParser.create().export('START')
    };
  },

  START: sym('tag'),

  tag: seq(
    '<',
    literal_ic('foam'),
    sym('whitespace'),
    sym('attributes'),
    sym('whitespace'),
    alt(sym('closed'), sym('matching'))
  ),

  closed: literal('/>'),

  matching: seq1(1,'>', sym('html'), sym('endTag')),

  endTag: seq1(1, '</', literal_ic('foam'), '>'),

  label: str(plus(notChars(' =/\t\r\n<>\'"'))),

  attributes: repeat(sym('attribute'), sym('whitespace')),

  attribute: seq(sym('label'), '=', sym('value')),

  value: str(alt(
    plus(alt(range('a','z'), range('A', 'Z'), range('0', '9'))),
    seq1(1, '"', repeat(notChar('"')), '"')
  )),

  whitespace: repeat(alt(' ', '\t', '\r', '\n'))

}.addActions({
  attributes: function(xs) {
    var attrs = {};
    xs.forEach(function(attr) { attrs[attr[0]] = attr[2]; });
    return attrs;
  },
  tag: function(xs) {
    return X.foam.html.Element.create({nodeName: xs[1], attributes: xs[3], childNodes: xs[5]});
  },
  closed:   function()   { return []; },
  matching: function(xs) { return xs.children; }
});


var TemplateParser = {
  __proto__: grammar,

  START: sym('markup'),

  markup: repeat0(alt(
    sym('comment'),
    sym('foamTag'),
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

  'comment': seq('<!--', repeat(not('-->', anyChar)), '-->'),

  'foamTag': sym('foamTag_'),
  'foamTag_': function() {}, // placeholder until gets filled in after HTMLParser is built

  'create child': seq(
    '$$',
    repeat(notChars(' $\n<{')),
    optional(JSONParser.export('objAsString'))),

  'simple value': seq('%%', repeat(notChars(' -"\n<'))),

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


function elementFromString(str) {
  return str.element || ( str.element = HTMLParser.create().parseString(str).children[0] );
}


var TemplateCompiler = {
  __proto__: TemplateParser,

  out: [],

  push: function() { this.out.push.apply(this.out, arguments); },

  header: 'var self = this; var X = this.X; var escapeHTML = XMLUtil.escape; var out = opt_out ? opt_out : TemplateOutput.create(this);' +
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
  foamTag: function(e) {
    function buildAttrs(e, attrToDelete) {
      var attrs = e.attributes.clone();
      delete attrs[attrToDelete];
      return attrs;
    }

    // A Feature
    if ( e.attributes.f ) {
      var name = e.attributes.f.constantize();
      this.push("', self.createTemplateView('", name, "',");
      this.push(JSON.stringify(buildAttrs(e, 'f')));
    }
    // A Model
    else if ( e.attributes.model ) {
      var modelName = e.attributes.model;
      this.push("', X.", modelName, '.create(');
      this.push(JSON.stringify(buildAttrs(e, 'model')));
    }
    else {
      console.error('Foam tag must define either "model" or "f" attribute.'); 
    }

    if ( e.children.length ) {
      this.push(')');
      e.attributes = [];
      this.push('.fromElement(elementFromString("' + e.outerHTML.replace(/\n/g, '\\n').replace(/"/g, '\\"') + '")');
    }

    this.push("),\n'");
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

     var f = function() {
       if ( ! delegate ) {
         if ( ! t.template )
           throw 'Must arequire() template model before use for ' + this.name_ + '.' + t.name;
         delegate = TemplateUtil.compile(Template.isInstance(t) ? t : Template.create(t));
       }

       return delegate.apply(this, arguments);
     };

     f.toString = function() { return delegate ? delegate.toString() : t; };

     return f;
   },

   compile: window.chrome && window.chrome.app && window.chrome.app.runtime ?
     function() {
       return function() {
         return this.name_ + " wasn't required.  Models must be arequired()'ed for Templates to be compiled in Packaged Apps.";
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
   templateMemberExpander: function(self, t, opt_X) {
     var X = opt_X? opt_X : self.X;

     // Load templates from an external file
     // if their 'template' property isn't set
     if ( typeof t === 'function' ) {
       t = X.Template.create({
         name: t.name,
         // ignore first argument, which should be 'opt_out'
         args: t.toString().match(/\((.*?)\)/)[1].split(',').slice(1).map(function(a) {
           return X.Arg.create({name: a.trim()});
         }),
         template: multiline(t)});
     } else if ( typeof t === 'string' ) {
       t = docTemplate = X.Template.create({
         name: 'body',
         template: t
       });
     } else if ( ! t.template ) {
       var future = afuture();
       var path = self.sourcePath;

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
     }

     if (!t.template$) {
       // we haven't FOAMalized the template, and there's no crazy multiline functions.
       // Note that Model and boostrappy models must use this case, as Template is not
       // yet defined at bootstrap time. Use a Template object definition with a bare
       // string template body in those cases.
       if (typeof X.Template != "undefined")
         t = JSONUtil.mapToObj(X, t, X.Template);
       else
         t = JSONUtil.mapToObj(X, t); // safe for bootstrap, but won't do anything in that case.
     }

     return t;
   },

   modelExpandTemplates: function(self, templates) {
     for (var i = 0; i < templates.length; i++) {
       templates[i] = TemplateUtil.templateMemberExpander(self, templates[i]);
     }

  }
};


/** Is actually synchronous but is replaced in ChromeApp with an async version. **/
var aeval = function(src) {
  return aconstant(eval('(' + src + ')'));
};


var aevalTemplate = function(t) {
  var doEval = function(t) {
    var code = TemplateCompiler.parseString(t.template);

    try {
      var args = ['opt_out'];
      for ( var i = 0 ; i < t.args.length ; i++ ) {
        args.push(t.args[i].name);
      }
      return aeval('function(' + args.join(',') + '){' + code + '}');
    } catch (err) {
      console.log('Template Error: ', err);
      console.log(code);
      return aconstant(function(){return 'TemplateError: Check console.';});
    }
  }

  if ( t.template ) {
    return doEval(t);
  }

  return aseq(
    t.futureTemplate,
    function(ret, t) {
      doEval(t)(ret);
    });
};


