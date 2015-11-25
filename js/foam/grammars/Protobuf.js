/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

CLASS({
  name: 'Protobuf',
  package: 'foam.grammars',
  requires: [
    'node.dao.JSModelFileDAO',
  ],

  properties: [
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'fs',
    },
    {
      name: 'inputFile',
    },
    {
      name: 'outputDir',
    },
    {
      name: 'grammar',
      factory: function() {
        return  SkipGrammar.create({
          __proto__: grammar,

          START: sym('proto'),

          d: range('0', '9'),

          w: alt(sym('d'), range('a', 'z'), range('A', 'Z'), "_"),

          a: alt(range('a', 'z'), range('A', 'Z')),

          proto: repeat(alt(
            sym('message'),
            sym('extend'),
            sym('enum'),
            sym('import'),
            sym('package'),
            sym('service'),
            sym('option'),
            sym('syntax'), ';')),

          syntax: seq("syntax", "=", sym('strLit'), ";"),

          import: seq("import", sym('strLit'), ";"),

          package: seq("package", sym('ident'), repeat(seq(".", sym("ident"))), ";"),

          option: seq("option", sym('optionBody'), ";"),

          optionBody: seq(
            alt(
              seq1(1, '(', plus(sym('ident'), '.'), ')'),
              sym('ident')),
            repeat(seq(".", sym('ident'))),
            "=", sym('constant')),

          message: seq("message", sym('ident'), sym('messageBody')),

          extend: seq("extend", sym('userType'), sym('messageBody')),

          enum: seq("enum", sym('ident'), sym("openBrace"), repeat(alt(sym('option'), sym('enumField'), ";")), sym("closeBrace")),

          enumField: seq(sym('ident'), "=", sym('sintLit'), ";"),

          service: seq("service", sym('ident'), sym("openBrace"), repeat(alt(sym('option'), sym('rpc'))), sym("closeBrace")),

          rpc: seq("rpc", sym('ident'), "(", sym('userType'), ")", "returns", "(", sym('userType'), ")", optional(seq1(1, '{', repeat(sym('option')), '}')), ';'),

          openBrace: literal("{"),
          closeBrace: literal("}"),

          messageBody: seq(
            sym('openBrace'),
            repeat(
              alt(sym('field'), sym('enum'), sym('message'), sym('extend'), sym('extensions'), sym('group'), sym('option'), ';')
            ),
            sym('closeBrace')),

          group: seq(sym('modifier'), "group", sym('camelIdent'), "=", sym('intLit'), sym('messageBody')),

          // tag number must be 2^28-1 or lower
          field: seq(
            sym('modifier'),
            sym('type'),
            sym('ident'),
            "=",
            sym('intLit'),
            optional(seq("[", sym('fieldOption'), repeat(",", sym('fieldOption') ), "]")),
            ";"),

          fieldOption: alt(sym('optionBody'), seq("default", "=", sym('constant'))),

          extensions: seq("extensions", sym('intLit'), "to", alt(sym('intLit'), "max"), ";"),

          modifier: alt("required", "optional", "repeated"),

          type: alt(
            "double", "float", "int32", "int64", "uint32", "uint64",
            "sint32", "sint64", "fixed32", "fixed64", "sfixed32",
            "sfixed64", "bool", "string", "bytes", sym('userType')),

          // leading dot for identifiers means they're fully qualified
          userType: noskip(plus(seq(optional("."), sym('ident')))),

          constant: alt(sym('ident'), sym('floatLit'), sym('sintLit'), sym('strLit'), sym('boolLit')),

          ident: seq(sym('a'), repeat(sym('w'))),

          // according to parser.cc, group names must start with a capital letter as a
          // hack for backwards-compatibility
          camelIdent: seq(range('A', 'Z'), repeat(sym('w'))),

          intLit: alt(sym('decInt'), sym('hexInt'), sym('octInt')),

          sintLit: alt(
            seq(alt('+', '-'), sym('decInt')),
            sym('intLit')),

          decInt: plus(sym('d')),

          hexInt: seq('/0', alt('x', 'X'), plus(alt(range('A','F'), range('a', 'f'), range('0', '9')))),

          octInt: seq('/0', plus(range('0', '7'))),

          floatLit: alt(
            seq('.', sym('decInt'), optional(sym('exponent'))),
            seq(sym('decInt'), sym('exponent')),
            seq(sym('decInt'), '.', optional(sym('decInt')), optional(sym('exponent')))),

          exponent: seq(alt('E', 'e'), optional(alt('+', '-')), sym('decInt')),

          boolLit: alt("true", "false"),

          strLit: noskip(seq(sym('quote'), repeat(alt(sym('hexEscape'), sym('octEscape'), sym('charEscape'), sym('quoteEscape'), not(sym('quote'), anyChar))) ,sym('quote'))),

          quote: alt('"', "'"),

          hexEscape: seq('\\', alt('x', 'X'), repeat(alt(range('A','F'), range('a', 'f'), range('0', '9'), undefined, 1,2))),

          octEscape: seq('\\0', repeat(range('0', '7'), undefined, 1, 3)),

          charEscape: seq('\\', alt('a', 'b', 'f', 'n', 'r', 't', 'v','?')),

          quoteEscape: seq('\\"'),
        }, alt(repeat0(alt(' ', '\t', '\n', '\r')), // Skip whitespace and C++ style comments.
               seq('//', repeat0(notChar('\n')))));

      }
    },
    {
      name: 'parser',
      factory: function() {
        var X = this.X;
        return this.grammar.addActions({
          package: function(a) {
            this.currentPackage = a[1];
            if ( a[2] && a[2].length ) {
              this.currentPackage += a[2].map(function(a) { return a.join(''); }).join('')
            }
          },

          quoteEscape: function(a) {
            return ['"'];
          },

          enumField: function(a) {
            return [a[0], a[2]];
          },

          enum: function(a) {
            var constants = {};
            var name = a[1];
            var values = a[3];
            for ( var i = 0 ; i < values.length ; i++ ) {
              var value = values[i];
              constants[value[0]] = value[1][1];
            }
            var m = Model.create({
              name: name,
              package: this.currentPackage,
              constants: constants
            });
            return m;
          },

          userType: function(a) {
            return a[0].join('');
          },

          field: function(a) {
            if (a[0] === 'repeated') {
              return ArrayProperty.create({
                subType: a[1],
                name: a[2],
                prototag: a[4]
              });
            } else {
              var prop = Property.create({
                type: a[1],
                name: a[2],
                prototag: a[4],
                required: a[0] === 'required'
              });
              // TODO: Hack for enums unti they're modelled.
              var subtype = (this.ctx || GLOBAL)[prop.type];
              if ( subtype && subtype.type === 'Enum' ) {
                prop.outProtobuf = function(obj, out) {
                  if ( this.f(obj) === "" ) return;
                  outProtobufPrimitive('int32', this.prototag, this.f(obj), out);
                };
              }
              return prop;
            }
          },

          message: function(a) {
            var properties = [];
            var models = [];
            for (var i = 0; i < a[2].length; i++) {
              if ( ! a[2][i] ) continue;

              if ( Property.isInstance(a[2][i]) ) {
                properties.push(a[2][i]);
              } else if ( Model.isInstance(a[2][i]) ) {
                models.push(a[2][i]);
              }
            }
            var args = {
              name: a[1],
              properties: properties,
              models: models
            };
            if ( this.currentPackage ) args.package = this.currentPackage;
            var model = Model.create(args);
            return model;
          },

          messageBody: function(a) { return a[1]; },

          ident: function(a) { return a[0] + a[1].join(''); },

          decInt: function(a) { return parseInt(a.join('')); }
        });
      }
    }
  ],

  methods: [
    function execute() {
      if (!this.inputFile || !this.outputDir) {
        console.error('inputFile and outputDir arguments are required.');
        process.exit(1);
      }
      var buffer = this.fs.readFileSync(this.inputFile);
      var output = this.parser.parseString(buffer.toString());
      var dao = this.JSModelFileDAO.create({
        prefix: this.outputDir
      });
      for (var i = 0; i < output.length; i++) {
        if (Model.isInstance(output[i])) {
          dao.put(output[i]);
        }
      }
    },
  ]
});
