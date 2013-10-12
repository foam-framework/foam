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

/* Ex.
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

function test(str) {
  console.log('input: ', str);
  console.log('output: ', TemplateCompiler.parseString(str));
}

test('foo');
test("foo 'bar'");
test('foo <%= 1,2,3 %>');
test('foo <% out.push("foobar"); %>');
