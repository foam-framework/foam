package foam.lib.json;

import foam.core2.FObject;
import foam.core.Property;
import foam.lib.parse.*;

public class PropertyParser extends ProxyParser {
  private Property property;

  public PropertyParser(Property p) {
    super(
          new Seq1(5,
                   new Whitespace(),
                   new KeyParser(p.getName()),
                   new Whitespace(),
                   new Literal(":"),
                   new Whitespace(),
                   p.getJavaJsonParser(),
                   new Whitespace()));
    property = p;
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return null;
    FObject fobj = (FObject)x.get("obj");
    fobj.set(property.getName(), ps.value());
    return ps;
  }
}
