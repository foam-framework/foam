package foam.lib.json;

import foam.lib.parse.*;
import foam.core.Model;
import foam.core2.FObject;

public class FObjectParser extends ProxyParser {
  public FObjectParser() {
    super(new Seq1(7,
                   new Whitespace(),
                   new Literal("{"),
                   new Whitespace(),
                   new KeyParser("class"),
                   new Whitespace(),
                   new Literal(":"),
                   new Whitespace(),
                   new Parser() {
        private Parser delegate = new StringParser();
        public PStream parse(PStream ps, ParserContext x) {
          ps = delegate.parse(ps, x);
          if ( ps == null ) return null;

          Model c = foam.core.FoamModelMap.get(ps.value().toString());

          ParserContext subx = x.sub();
          Object obj = c.createInstance();
          subx.set("obj", obj);

          ps = ModelParserFactory.getInstance(c).parse(ps, subx);

          if ( ps != null ) {
            return ps.setValue(subx.get("obj"));
          }
          return null;
        }
      },
                   new Whitespace(),
                   new Literal("}")));
  }
}
