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

/**
 * Simple template system modelled after JSP's.
 *
 * Syntax:
 *    <% code %>: code inserted into template, but nothing implicitly output
 *    <%= comma-separated-values %>: all values are appended to template output
 *    \<new-line>: ignored
 *    %value<whitespace>: TODO: output a single value to the template output
 */
var TemplateUtil =
{

   compile: function(str)
   {
//console.log("compiling template: ", str);
      var str = "var out;" +
        "if ( opt_out ) { out = opt_out; } else { var buf = []; out = buf.push.bind(buf); }\n" +
	"out('" + str
	   .replace(/'/g, "\\'")
	   .replace(/<%=(([^%]|(%[^>]))*)%>/g, function(unused,s){ return "'," + s.replace(/\\'/g, "'") + ",'"; })
	   .replace(/<%(([^%]|(%[^>]))*)%>/g, function(unused,s){ return "');\n" + s.replace(/\\'/g, "'") + "\nout('";} ) +
        "\');" +
	"if ( ! opt_out ) return buf.join('');";

      // Convert newlines inside of string literals into \n's
      // and remove newlines preceeded with a backslash (\).
      for ( var i = 0 ; i < str.length ; )
      {
	 i = str.indexOf("out('", i);

	 if ( i == -1 ) break;

	 var j = str.indexOf("');", i);

	 if ( j == -1 ) break;

	 str = str.slice(0,i-1) + str.slice(i,j).replace(/\\\n/g, '').replace(/\n/g, '\\n') + str.slice(j);

	 i = j;
      }

     try
     {
      return new Function("opt_out", str);
     }
     catch (err)
     {
       console.log("Template Error: " + err);
       console.log(str);
     }
   },

   /**
    * Combinator which takes a template which expects an output parameter and
    * converts it into a function which returns a string.
    */
   stringifyTemplate: function (template)
   {
      return function()
      {
	 var buf = [];

	 this.output(buf.push.bind(buf), obj);

	 return buf.join('');
      };
   }
};

/*ex
public class <% out(this.model_.name); %>
{
   <% for ( var key in this.model_.properties ) {
      var prop = this.model_.properties[key]; %>
     <%= prop.type %> <%= prop.name %>;
   <% } %>

   public <%= this.model_.name %>()
   {

   }

}
 */

