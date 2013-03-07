
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
