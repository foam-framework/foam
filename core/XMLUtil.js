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
var XMLParser = {
  __proto__: grammar,

  START: seq1(1, sym('whitespace'), sym('tag'), sym('whitespace')),

  tag: seq(
      '<',
      sym('tagName'),
      sym('whitespace'),
      repeat(sym('attribute'), sym('whitespace')),
      sym('whitespace'),
      '>',
      repeat(alt(
        sym('tag'),
        sym('text')
      )),
      '</', sym('tagName'), '>'
    ),

  label: str(plus(notChars(' =/\t\r\n<>\'"'))),

  tagName: sym('label'),

  text: str(plus(notChar('<'))),

  attribute: seq(sym('label'), '=', sym('value')),

  value: str(alt(
    seq1(1, '"', repeat(notChar('"')), '"'),
    seq1(1, "'", repeat(notChar("'")), "'")
  )),

  whitespace: repeat(alt(' ', '\t', '\r', '\n'))
};

XMLParser.addActions({
  // Trying to abstract all the details of the parser into one place,
  // and to use a more generic representation in XMLUtil.parse().
  tag: function(xs) {
    // < label ws attributes ws > children </ label >
    // 0 1     2  3          4  5 6        7  8     9

    // Mismatched XML tags
    // TODO: We should be able to set the error message on the ps here.
    if ( xs[1] != xs[8] ) return undefined;

    var obj = { tag: xs[1], attrs: {}, children: xs[6] };

    xs[3].forEach(function(attr) { obj.attrs[attr[0]] = attr[2]; });

    return obj;
  }
});


var XMLUtil = {

  escape: function(str) {
    return str && str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
  },

  unescape: function(str) {
    return str && str.toString()
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
  },

  escapeAttr: function(str) {
    return str && str.replace(/"/g, '&quot;');
  },

  unescapeAttr: function(str) {
    return str && str.replace(/&quot;/g, '"');
  },

  parse: function(str) {
    var result = XMLParser.parseString(str);
    if ( ! result ) return result; // Parse error on undefined.

    // Otherwise result is the <foam> tag.
    return this.parseArray(result.children);
  },

  parseObject: function(tag) {
    var obj = {};
    var self = this;
    tag.children.forEach(function(c) {
      // Ignore children which are not tags.
      if (typeof c === 'object' && c.attrs && c.attrs.name) {
        var result;
        if ( c.attrs.type && c.attrs.type == 'function' ) {
          var code = XMLUtil.unescape(c.children.join(''));
          if ( code.startsWith('function') ) {
            result = eval('(' + code + ')');
          } else {
            result = new Function(code);
          }
        } else {
          result = self.parseArray(c.children);
        }

        obj[self.unescapeAttr(c.attrs.name)] = result;
      }
    });

    if ( !tag.attrs.model ) return obj;
    var model = this.unescapeAttr(tag.attrs.model);
    return GLOBAL[model] ?  GLOBAL[model].create(obj) : obj;
  },

  parseArray: function(a) {
    // Turn <i> tags into primitive values, everything else goes through
    // parseObject.
    // Any loose primitive values are junk whitespace, and ignored.
    var self = this;
    var ret = [];
    a.forEach(function(x) {
      if ( typeof x !== 'object' ) return;
      if ( x.tag == 'i' ) {
        ret.push(XMLUtil.unescape(x.children[0])); // Literal content.
      } else {
        ret.push(self.parseObject(x));
      }
    });

    // Special case: If we found nothing, return all children as a string.
    return ret.length ? ret : XMLUtil.unescape(a.join(''));
  },

  compact: {
    stringify: function(obj) {
      var buf = [];

      this.output(buf.push.bind(buf), obj);

      return '<foam>' + buf.join('') + '</foam>';
    },

    output: function(out, obj) {
      if ( Array.isArray(obj) ) {
        this.outputArray_(out, obj);
      }
      else if ( typeof obj == 'string' ) {
        out(XMLUtil.escape(obj));
      }
      else if ( obj instanceof Function ) {
        this.outputFunction_(out, obj);
      }
      else if ( obj instanceof Date ) {
        out(obj.getTime());
      }
      else if ( obj instanceof Object ) {
        if ( obj.model_ )
          this.outputObject_(out, obj);
        else
          this.outputMap_(out, obj);
      }
      else {
        out(obj);
      }
    },

    outputObject_: function(out, obj) {
      out('<object model="', XMLUtil.escapeAttr(obj.model_.name), '">');

      var properties = obj.model_.getRuntimeProperties();
      for ( var key in properties ) {
        var prop = properties[key];

        if ( prop.name === 'parent' ) continue;
        if ( obj.instance_ && prop.name in obj.instance_ ) {
          var val = obj[prop.name];

          if ( Array.isArray(val) && val.length == 0 ) continue;

          if ( equals(val, prop.defaultValue) ) continue;

          out('<property name="', XMLUtil.escapeAttr(prop.name), '" ' +
              (typeof val === 'function' ? 'type="function"' : '') + '>');
          this.output(out, val);
          out('</property>');
        }
      }

      out('</object>');
    },

    outputMap_: function(out, obj) {
      out('<object>');

      for ( var key in obj ) {
        var val = obj[key];

        out('<property name="', XMLUtil.escapeAttr(key), '">');
        this.output(out, val);
        out('</property>');
      }

      out('</object>');
    },

    outputArray_: function(out, a) {
      if ( a.length == 0 ) return out;

      for ( var i = 0 ; i < a.length ; i++, first = false ) {
        var obj = a[i];

        if (typeof obj === 'string' || typeof obj === 'number')
          out('<i>', XMLUtil.escape(obj), '</i>');
        else
          this.output(out, obj);
      }
    },
    outputFunction_: function(out, f) {
      out(XMLUtil.escape(f.toString()));
    }
  },

  pretty: {
    stringify: function(obj) {
      var buf = [];

      this.output(buf.push.bind(buf), obj);

      return '<foam>\n' + buf.join('') + '</foam>\n';
    },

    output: function(out, obj, opt_indent) {
      var indent = opt_indent || "";

      if ( Array.isArray(obj) ) {
        this.outputArray_(out, obj, indent);
      }
      else if ( typeof obj == 'string' ) {
        out(XMLUtil.escape(obj));
      }
      else if ( obj instanceof Function ) {
        this.outputFunction_(out, obj, indent);
      }
      else if ( obj instanceof Date ) {
        out(obj.getTime());
      }
      else if ( obj instanceof Object ) {
        try {
          if ( obj.model_ && typeof obj.model_ !== 'string' )
            this.outputObject_(out, obj, indent);
          else
            this.outputMap_(out, obj, indent);
        }
        catch (x) {
          console.log('toXMLError: ', x);
        }
      }
      else {
        out(obj);
      }
    },

    outputObject_: function(out, obj, opt_indent) {
      var indent       = opt_indent || "";
      var nestedIndent = indent + "  ";

      out(indent, '<object model="', XMLUtil.escapeAttr(obj.model_.name), '">');

      var properties = obj.model_.getRuntimeProperties();
      for ( var key in properties ) {
        var prop = properties[key];

        if ( prop.name === 'parent' ) continue;
        if ( obj.instance_ && prop.name in obj.instance_ ) {
          var val = obj[prop.name];

          if ( Array.isArray(val) && val.length == 0 ) continue;

          if ( val == prop.defaultValue ) continue;

          var type = typeof obj[prop.name] == 'function' ?
              ' type="function"' : '';
          out("\n", nestedIndent, '<property name="',
              XMLUtil.escapeAttr(prop.name), '"', type, '>');
          this.output(out, val, nestedIndent);
          out('</property>');
        }
      }

      out('\n', indent, '</object>');
      out('\n');
    },

    outputMap_: function(out, obj, opt_indent) {
      var indent       = opt_indent || "";
      var nestedIndent = indent + "  ";

      out(indent, '<object>');

      for ( var key in obj ) {
        var val = obj[key];

        out("\n", nestedIndent, '<property name="', XMLUtil.escapeAttr(key), '">');
        this.output(out, val, nestedIndent);
        out('</property>');
      }

      out("\n", indent, '</object>\n');
    },

    outputArray_: function(out, a, opt_indent) {
      if ( a.length == 0 ) return out;

      var indent       = opt_indent || "";
      var nestedIndent = indent + "  ";

      for ( var i = 0 ; i < a.length ; i++, first = false ) {
        var obj = a[i];

        out('\n');
        if (typeof obj === 'string' || typeof obj === 'number')
          out(nestedIndent, '<i>', XMLUtil.escape(obj), '</i>');
        else
          this.output(out, obj, nestedIndent);
      }
      out('\n',indent);
    },
    outputFunction_: function(out, f, opt_indent) {
      out(XMLUtil.escape(f.toString()) + '\n' + (opt_indent || ''));
    }
  }
};

XMLUtil.stringify = XMLUtil.pretty.stringify.bind(XMLUtil.pretty);
XMLUtil.output = XMLUtil.pretty.output.bind(XMLUtil.pretty);;
