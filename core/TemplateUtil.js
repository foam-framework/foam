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

MODEL({
  name: 'TemplateParser',
  extends: 'grammar',

  methods: {
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

    'comment': seq1(1, '<!--', repeat0(not('-->', anyChar)), '-->'),

    'foamTag': sym('foamTag_'),
    'foamTag_': function() { }, // placeholder until gets filled in after HTMLParser is built

    'create child': seq(
      '$$',
      repeat(notChars(' $\r\n<{,.')),
      optional(JSONParser.export('objAsString'))),

    'simple value': seq('%%', repeat(notChars(' ()-"\r\n><:;,')), optional('()')),

    'live value tag': seq('<%#', repeat(not('%>', anyChar)), '%>'),

    'raw values tag': alt(
      seq('<%=', repeat(not('%>', anyChar)), '%>'),
      seq('{{{', repeat(not('}}}', anyChar)), '}}}')
    ),

    'values tag': seq('{{', repeat(not('}}', anyChar)), '}}'),

    'code tag': seq('<%', repeat(not('%>', anyChar)), '%>'),
    'ignored newline': alt(
      literal('\\\r\\\n'),
      literal('\\\n')
    ),
    newline: alt(
      literal('\r\n'),
      literal('\n')
    ),
    'single quote': literal("'"),
    text: anyChar
  }
});


var TemplateOutput = {
  /**
   * obj - Parent object.  If objects are output and have an initHTML() method, then they
   * are added to the parent by calling obj.addChild().
   **/
  // TODO(kgr): redesign, I think this is actually broken.  If we call appendHTML() of
  // a sub-view then it will be added to the wrong parent.
  create: function(obj) {
    console.assert(obj, 'Owner required when creating TemplateOutput.');
    var buf = [];
    var f = function templateOut(/* arguments */) {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        var o = arguments[i];
        if ( typeof o === 'string' ) {
          buf.push(o);
        } else if ( o && 'Element' === o.name_ ) {
          // Temporary bridge for working with foam.u2 Views
          var s = o.createOutputStream();
          o.output(s);
          buf.push(s.toString());
          // Needs to be bound, since o is a loop variable and will otherwise
          // be the final element of the arguments array, not the correct one.
          obj.addChild({ initHTML: o.load.bind(o) });
        } else {
          if ( o && o.toView_ ) o = o.toView_();
          if ( ! ( o === null || o === undefined ) ) {
            if ( o.appendHTML ) {
              o.appendHTML(this);
            } else if ( o.toHTML ) {
              buf.push(o.toHTML());
            } else {
              buf.push(o);
            }
            if ( o.initHTML && obj && obj.addChild ) obj.addChild(o);
          }
        }
      }
    };

    f.toString = function() {
      if ( buf.length === 0 ) return '';
      if ( buf.length > 1 ) buf = [buf.join('')];
      return buf[0];
    }

    return f;
  }
};


// Called from generated template code.
function elementFromString(str) {
  return str.element || ( str.element = HTMLParser.create().parseString(str).children[0] );
}

var ConstantTemplate = function(str) {
  var TemplateOutputCreate = TemplateOutput.create.bind(TemplateOutput);
  var f = function(opt_out) {
    var out = opt_out ? opt_out : TemplateOutputCreate(this);
    out(str);
    return out.toString();
  };

  f.toString = function() {
    return 'ConstantTemplate("' + str.replace(/\n/g, "\\n").replace(/"/g, '\\"').replace(/\r/g, '') + '")';
  };

  return f;
};

var TemplateCompiler = {
  __proto__: TemplateParser,

  out: [],

  simple: true, // True iff the template is just one string literal.

  push: function() { this.simple = false; this.pushSimple.apply(this, arguments); },

  pushSimple: function() { this.out.push.apply(this.out, arguments); }

}.addActions({
  markup: function (v) {
    var wasSimple = this.simple;
    var ret = wasSimple ? null : this.out.join('');
    this.out = [];
    this.simple = true;
    return [wasSimple, ret];
  },

  'create child': function(v) {
    var name = v[1].join('');
    this.push(
      "', self.createTemplateView('", name, "'",
      v[2] ? ', ' + v[2] : '',
      "),\n'");
  },
  foamTag: function(e) {
    // A Feature
    var fName = e.getAttribute('f');
    if ( fName ) {
      this.push("', self.createTemplateView('", fName, "',{}).fromElement(FOAM(");
      this.push(JSONUtil.where(NOT_TRANSIENT).stringify(e));
      this.push('))');
    }
    // A Model
    else {
      this.push("', (function() { var tagView = X.foam.ui.FoamTagView.create({element: FOAM(");
      this.push(JSONUtil.where(NOT_TRANSIENT).stringify(e));
      this.push(')}, Y); self.addDataChild(tagView); return tagView; })() ');
    }

    this.push(",\n'");
  },
  'simple value': function(v) { this.push("',\n self.", v[1].join(''), v[2], ",\n'"); },
  'raw values tag': function (v) { this.push("',\n", v[1].join(''), ",\n'"); },
  'values tag':     function (v) { this.push("',\nescapeHTML(", v[1].join(''), "),\n'"); },
  'live value tag': function (v) { this.push("',\nself.dynamicTag('span', function() { return ", v[1].join(''), "; }.bind(this)),\n'"); },
  'code tag': function (v) { this.push("');\n", v[1].join(''), ";out('"); },
  'single quote': function () { this.pushSimple("\\'"); },
  newline: function () { this.pushSimple('\\n'); },
  text: function(v) { this.pushSimple(v); }
});


MODEL({
  name: 'TemplateUtil',

  constants: {
    HEADER: 'var self = this, X = this.X, Y = this.Y;' +
        'var out = opt_out ? opt_out : TOC(this);' +
        "out('",
    FOOTERS: {
      html: "');return out.toString();",
      css: "');return X.foam.grammars.CSSDecl.create({model:this.model_}).parser.parseString(out.toString());"
    },
  },

  methods: {
    /** Create a method which only compiles the template when first used. **/
    lazyCompile: function(t) {
      var delegate;

      var f = function() {
        if ( ! delegate ) {
          if ( ! t.template )
            throw 'Must arequire() template model before use for ' + this.name_ + '.' + t.name;
          else
            delegate = TemplateUtil.compile(Template.isInstance(t) ? t : Template.create(t), this.model_);
        }

        return delegate.apply(this, arguments);
      };

      f.toString = function() { return delegate ? delegate.toString() : t.toString(); };

      return f;
    },

    compile_: function(t, code, model) {
      var args = ['opt_out'];
      for ( var i = 0 ; i < t.args.length ; i++ ) {
        args.push(t.args[i].name);
      }
      return eval(
        '(function() { ' +
          'var escapeHTML = XMLUtil.escape, TOC = TemplateOutput.create.bind(TemplateOutput); ' +
          'return function(' + args.join(',') + '){' + code + '};})()' +
          (model && model.id ? '\n\n//# sourceURL=' + model.id.replace(/\./g, '/') + '.' + t.name + '\n' : ''));
    },
    parseCSS: function(t, model) {
      var parser = this.CSSParser_ || ( this.CSSParser_ = X.foam.grammars.CSSDecl.create());
      parser.model = model;
      return parser.parser.parseString(t).toString();
    },
    parseU2: function(template, t, model) {
      X.foam.u2.ElementParser.getPrototype();

      var parser = this.U2Parser_ || ( this.U2Parser_ = X.foam.u2.ElementParser.parser__.create() );
      parser.modelName_ = cssClassize(model.id);
      var out = parser.parseString(
        t.trim(),
        template.name === 'initE' ? parser.initTemplate : parser.template);
      return out.toString();
    },
    compile: function(t, model) {
      if ( t.name !== 'CSS' ) {
        // TODO: this doesn't work
        if ( model.isSubModel(X.lookup('foam.u2.Element')) ) {
          return eval('(function() { return ' + this.parseU2(t, t.template, model) + '; })()');
        }
        if ( t.template.startsWith('#U2') ) {
          var code = '(function() { return ' + this.parseU2(t, t.template.substring(3), model) + '; })()';
          return eval(code);
        }
      }
      // Parse result: [isSimple, maybeCode]: [true, null] or [false, codeString].
      var parseResult = TemplateCompiler.parseString(t.template);

      // Simple case, just a string literal
      if ( parseResult[0] )
        return ConstantTemplate(t.language === 'css' ?
            this.parseCSS(t.template, model) :
            t.template) ;

      var code = this.HEADER + parseResult[1] + this.FOOTERS[t.language];

      // Need to compile an actual method
      try {
        return this.compile_(t, code, model);
      } catch (err) {
        console.log('Template Error: ', err);
        console.log(parseResult);
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

    expandTemplate: function(self, t, opt_X) {
      /*
       * If a template is supplied as a function, treat it as a multiline string.
       * Parse function arguments to populate template.args.
       * Load template from file if external.
       * Setup template future.
       */
      var X = opt_X || self.X;

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
      } else if ( ! t.template && ! t.code ) {
        t = X.Template.create(t);
        var future = afuture();
        var path   = self.sourcePath;

        t.futureTemplate = future.get;
        path = path.substring(0, path.lastIndexOf('/')+1);
        path += t.path ? t.path : self.name + '_' + t.name + '.ft';

        if ( typeof vm == "undefined" || ! vm.runInThisContext ) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", path);
          xhr.asend(function(data) {
            t.template = data;
            future.set(Template.create(t));
          });
        } else {
          var fs = require('fs');
          fs.readFile(path, function(err, data) {
            t.template = data.toString();
            future.set(Template.create(t));
          });
        }
      } else if ( typeof t.template === 'function' ) {
        t.template = multiline(t.template);
      }

      if ( ! t.futureTemplate ) t.futureTemplate = aconstant(t);

      // We haven't FOAMalized the template, and there's no crazy multiline functions.
      // Note that Model and boostrappy models must use this case, as Template is not
      // yet defined at bootstrap time. Use a Template object definition with a bare
      // string template body in those cases.
      if ( ! t.template$ ) {
        t = ( typeof X.Template !== 'undefined' ) ? JSONUtil.mapToObj(X, t, X.Template) : t ;
      }

      return t;
    },

    expandModelTemplates: function(self) {
      var templates = self.templates;
      for ( var i = 0; i < templates.length; i++ ) {
        templates[i] = TemplateUtil.expandTemplate(self, templates[i]);
      }
    }
  }
});


/** Is actually synchronous but is replaced in ChromeApp with an async version. **/
var aeval = function(src) {
  return aconstant(eval('(' + src + ')'));
};

var aevalTemplate = function(t, model) {
  return aseq(
    t.futureTemplate,
    function(ret, t) {
      ret(TemplateUtil.lazyCompile(t));
    });
};

var escapeHTML = XMLUtil.escape, TOC = TemplateOutput.create.bind(TemplateOutput);
