/*
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

var XMLUtil =
{

   escape: function(str) {
     return str
       .replace(/&/g, '&amp;');
//       .replace(/\</g, '&lt;')
//       .replace(/\>/g, '&gt;');
   },

   parse: function(str) {
      // todo
   },

   compact:
   {

      stringify: function(obj) {
	 var buf = [];

	 this.output(buf.push.bind(buf), obj);

	 return buf.join('');
      },

      output: function(out, obj) {
	 if ( obj instanceof Array) {
	    this.outputArray_(out, obj);
	 }
	 else if ( typeof obj == 'string' ) {
	    out("'");
	    out(XMLUtil.escape(obj));
	    out("'");
	 }
	 else if ( obj instanceof Function ) {
	    out(obj);
	 }
	 else if ( obj instanceof Object ) {
	    try {
	       if ( obj.model_ )
		  this.outputObject_(out, obj);
	       else
		  this.outputMap_(out, obj);
	    }
	    catch (x)
	    {
	       console.log("toXMLError: ", x, obj);
	    }
	 }
	 else {
	    out(obj);
	 }
      },

      outputObject_: function(out, obj) {
       var str          = "";

       out('{', "model_:'", obj.model_.name, "'");

       for ( var key in obj.model_.properties ) {
	  var prop = obj.model_.properties[key];

	  if ( prop.name in obj.instance_ && prop.name != 'extendsPrototype' && obj[prop.name] )
	  {
             var val = obj[prop.name];

	     if ( val instanceof Array && val.length == 0 ) continue;

	     if ( val == prop.defaultValue ) continue;

	     out(",", prop.name, ':');
	     this.output(out, val);
	  }
       }

       out('}');
      },


      outputMap_: function(out, obj) {
       var str          = "";
       var first        = true;

       out('{');

       for ( var key in obj ) {
	  var val = obj[key];

	  if ( ! first ) out(",");
	  out(key, ':');
	  this.output(out, val);

	  first = false;
       }

       out('}');
      },

      outputArray_: function(out, a) {
       if ( a.length == 0 ) { out('[]'); return out; }

       var str          = "";
       var first        = true;

       out('[');

       for ( var i = 0 ; i < a.length ; i++, first = false ) {
	  var obj = a[i];

	  if ( ! first ) out(',');

	  this.output(out, obj);
       }

       out(']');
      }
   },


   pretty:
   {

      stringify: function(obj) {
	 var buf = [];

	 this.output(buf.push.bind(buf), obj);

	 return buf.join('');
      },

      output: function(out, obj, opt_indent) {
	 var indent = opt_indent || "";

	 if ( obj instanceof Array) {
	    this.outputArray_(out, obj, indent);
	 }
	 else if ( typeof obj == 'string' ) {
	    out(XMLUtil.escape(obj));
	 }
	 else if ( obj instanceof Function ) {
	    out(obj);
	 }
	 else if ( obj instanceof Object ) {
	    try {
	       if ( obj.model_ )
		  this.outputObject_(out, obj, indent);
	       else
		  this.outputMap_(out, obj, indent);
	    }
	    catch (x) {
	       console.log('toXMLError: ', x.toString(), obj);
	    }
	 }
	 else {
	    out(obj);
	 }
      },

      outputObject_: function(out, obj, opt_indent) {
        var indent       = opt_indent || "";
        var nestedIndent = indent + "   ";
        var str          = "";

        out(indent, '<', obj.model_.name, '>');

        for ( var key in obj.model_.properties ) {
	  var prop = obj.model_.properties[key];

if ( prop.name === 'parent' ) continue;
	  if ( obj.instance_ && prop.name in obj.instance_ && prop.name != 'extendsPrototype' /* && obj[prop.name] */ )
	  {
             var val = obj[prop.name];

	     if ( val instanceof Array && val.length == 0 ) continue;

	     if ( val == prop.defaultValue ) continue;

	     out("\n", nestedIndent, '<', prop.name, '>');
	     this.output(out, val, nestedIndent);
	     out('</', prop.name, '>');
	  }
        }

        out('\n', indent, '</', obj.model_.name, '>');
	out('\n',indent);
      },

      outputMap_: function(out, obj, opt_indent) {
        var indent       = opt_indent || "";
        var nestedIndent = indent + "   ";
        var str          = "";

        out(indent, '<map>');

        for ( var key in obj ) {
	  var val = obj[key];


	  out("\n", nestedIndent, '<', key, '>');
	  this.output(out, val, nestedIndent);
	  out('</', key, '>');
        }

        out("\n", indent, '</map>');
      },

      outputArray_: function(out, a, opt_indent) {
        if ( a.length == 0 ) return out;

        var indent       = opt_indent || "";
        var nestedIndent = indent + "   ";
        var str          = "";

        for ( var i = 0 ; i < a.length ; i++, first = false ) {
	  var obj = a[i];

	  out('\n');
	  if ( typeof obj == 'string' )	out(nestedIndent, '<i>');
	  this.output(out, obj, nestedIndent);
	  if ( typeof obj == 'string' )	out('</i>');
        }
	out('\n',indent);
      }
   }


};

XMLUtil.stringify = XMLUtil.pretty.stringify.bind(XMLUtil.pretty);
XMLUtil.output = XMLUtil.pretty.output.bind(XMLUtil.pretty);;
