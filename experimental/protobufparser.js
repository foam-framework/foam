var protobufdef = {
  __proto__: grammar,

  START: sym('proto'),

  d: range('0', '9'), 

  w: alt(sym('d'), range('a', 'z'), range('A', 'Z')),

  a: alt(range('a', 'z'), range('A', 'Z')),

  proto: repeat(alt(
    sym('message'),
    sym('extend'),
    sym('enum'),
    sym('import'),
    sym('package'),
    sym('option'), ';'); 
 
  import: seq("import", sym('strLit'), ";"), 

  package: seq("package", sym('ident'), ";"), 

  option: seq("option", sym('optionBody'), ";"), 

  optionBody: seq(sym('ident'), repeat(seq(".", sym('ident'))), "=", sym('constant')), 

  message: seq("message", sym('ident'), sym('messageBody')), 

  extend: seq("extend", sym('userType'), sym('messageBody')), 

  enum: seq("enum", sym('ident'), "{", repeat(seq(sym('option'), sym('enumField')), ";"), "}"), 

  enumField: seq(sym('ident'), "=", sym('intLit'), ";"), 

  service: seq("service", sym('ident'), "{", repeat(seq(sym('option'), sym('rpc')), ";"), "}"), 

  rpc: seq("rpc", sym('ident'), "(", sym('userType'), ")", "returns", "(", sym('userType'), ")", ";"), 

  messageBody: seq("{", repeat(seq(sym('field, sym('enum, sym('message, sym('extend, sym('extensions, sym('group, sym('option), ":"), "}"), 

  group: seq(sym('modifier'), "group", sym('camelIdent'), "=", sym('intLit'), sym('messageBody')), 

  // tag number must be 2^28-1 or lower 
  field: seq(sym('modifier'), sym('type'), sym('ident'), "=", sym('intLit'), optional("[", sym('fieldOption'), repeat(",", sym('fieldOption') ), "]", ), ";"), 

  fieldOption: alt(sym('optionBody'), seq("default", "=", sym('constant'))), 

  extensions: seq("extensions", sym('intLit'), "to", alt(sym('intLit'), "max"), ";"), 

  modifier: alt("required", "optional", "repeated"), 

  type: alt(
      "double", "float", "int32", "int64", "uint32", "uint64", 
      "sint32", "sint64", "fixed32", "fixed64", "sfixed32", 
      "sfixed64", "bool", "string", "bytes", userType),

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

};