// Translated from EBNF at https://groups.google.com/forum/?fromgroups=#!topic/protobuf/HMz8YkzWEto

var ProtoBufGrammar = {
  __proto__: grammar,

  START: sym('proto'),

  d: range('0', '9'), 

  w: alt(sym('d'), range('a', 'z'), range('A', 'Z')),

  a: alt(range('a', 'z'), range('A', 'Z')),

  ws: repeat(alt(' ','\r','\n'), undefined),

  proto: repeat(alt(
    sym('message'),
    sym('extend'),
    sym('enum'),
    sym('import'),
    sym('package'),
    sym('option'), ';')), 
 
  import: seq("import", sym('strLit'), ";"), 

  package: seq("package", sym('ident'), ";"), 

  option: seq("option", sym('optionBody'), ";"), 

  optionBody: seq(sym('ident'), repeat(seq(".", sym('ident'))), "=", sym('constant')), 

  message: seq("message", sym('ws'), sym('ident'), sym('ws'), sym('messageBody')), 

  extend: seq("extend", sym('userType'), sym('messageBody')), 

  enum: seq("enum", sym('ws'), sym('ident'), sym('ws'), "{", sym('ws'), repeat(alt(sym('option'), sym('enumField'), ";"), sym('ws')), sym('ws'), "}"), 

  enumField: seq(sym('ident'), sym('ws'), "=", sym('ws'), sym('intLit'), sym('ws'), ";"), 

  service: seq("service", sym('ident'), "{", repeat(seq(sym('option'), sym('rpc')), ";"), "}"), 

  rpc: seq("rpc", sym('ident'), "(", sym('userType'), ")", "returns", "(", sym('userType'), ")", ";"), 

  messageBody: seq(
    "{",
      repeat(
        alt(sym('field'), sym('enum'), sym('message'), sym('extend'), sym('extensions'), sym('group'), sym('option'), ':'),
       sym('ws')
      ),
    "}"), 

  group: seq(sym('modifier'), sym('ws'), "group", sym('camelIdent'), "=", sym('intLit'), sym('messageBody')), 

  // tag number must be 2^28-1 or lower 
  field: seq(
    sym('modifier'),
    sym('ws'),
    sym('type'),
    sym('ws'),
    sym('ident'),
    sym('ws'),
    "=",
    sym('ws'),
    sym('intLit'),
    sym('ws'),
    optional(seq("[", sym('fieldOption'), repeat(",", sym('fieldOption') ), "]")),
    sym('ws'),
    ";"), 

  fieldOption: alt(sym('optionBody'), seq("default", "=", sym('constant'))), 

  extensions: seq("extensions", sym('intLit'), "to", alt(sym('intLit'), "max"), ";"), 

  modifier: alt("required", "optional", "repeated"), 

  type: alt(
      "double", "float", "int32", "int64", "uint32", "uint64", 
      "sint32", "sint64", "fixed32", "fixed64", "sfixed32", 
      "sfixed64", "bool", "string", "bytes", sym('userType')),

  // leading dot for identifiers means they're fully qualified 
  userType: plus(seq(optional("."), sym('ident'))), 

  constant: alt(sym('ident'), sym('intLit'), sym('floatLit'), sym('strLit'), sym('boolLit')),

  ident: seq(sym('a'), repeat(sym('w'))),

  // according to parser.cc, group names must start with a capital letter as a 
  // hack for backwards-compatibility 
  camelIdent: seq(range('A', 'Z'), repeat(sym('w'))), 

  intLit: alt(sym('decInt'), sym('hexInt'), sym('octInt')), 

  decInt: plus(sym('d')), 

  hexInt: seq('/0', alt('x', 'X'), plus(alt(range('A','F'), range('a', 'f'), range('0', '9')))),

  octInt: seq('/0', plus(range('0', '7'))),

  floatLit: seq(optional(seq(sym('decInt'), optional('.', sym('decInt')))), optional(seq(alt('E', 'e'), optional(alt('+', '-')), sym('decInt')))),

  boolLit: alt("true", "false"), 

  strLit: seq(sym('quote'), repeat(alt(sym('hexEscape'), sym('octEscape'), sym('charEscape'), notChar('\n'))) ,sym('quote')), 

  quote: alt('"', "'"), 

  hexEscape: seq('\\', alt('x', 'X'), repeat(alt(range('A','F'), range('a', 'f'), range('0', '9'), undefined, 1,2))), 

  octEscape: seq('\\0', repeat(range('0', '7'), undefined, 1, 3)), 

  charEscape: seq('\\', alt('a', 'b', 'f', 'n', 'r', 't', 'v','?')) 

}.addActions({

  enumField: function(a) {
console.log('enumField', a[0], a[4]);
    return [a[0], a[4]];
  },

  enum: function(a) {
    var e = {};
    var name = a[2];
    var values = a[6];
    for ( var i = 0 ; i < values.length ; i++ ) {
      var value = values[i];
      e[value[0]] = parseInt(value[1]);
    } 
    (this.ctx || GLOBAL)[name] = e; 
  },

  field: function(a) {
    return Property.create({
      type: a[2],
      name: a[4],
      prototag: a[8],
      required: a[0] === 'required'
    });
  },

  message: function(a) {
    return Model.create({
      name: a[2],
      properties: a[4]
    });
  },

  messageBody: function(a) { return a[1]; },

  ident: function(a) { return a[0] + a[1].join(''); },

  decInt: function(a) { return parseInt(a.join('')); }
});


var sample = "message Person{required int32 id = 1; required string name = 2; optional string email = 3;}";
var sample2 = "enum PhoneType {MOBILE = 3; HOME = 0; WORK = 2; }";

console.log('Parseing ProtoBuf:', ProtoBufGrammar.parseString(sample)[0].toJSON());

console.log('Parseing Enum:', ProtoBufGrammar.parseString(sample2)[0]);
console.log('PhoneType: ', PhoneType);

DEBUG_PARSE = true;
DEBUG_PARSE = false;
