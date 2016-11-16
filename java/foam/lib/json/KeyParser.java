package foam.lib.json;

import foam.lib.parse.*;

public class KeyParser implements Parser {
  private Parser delegate;

  public KeyParser(String key) {
    delegate = new Alt(
                       new Literal("\"" + key + "\""),
                       new Literal(key));

  }

  public PStream parse(PStream ps, ParserContext x) {
    return delegate.parse(ps, x);
  }
}
