package foam.lib.json;

import foam.lib.parse.*;

public class AnyParser extends ProxyParser {
  public AnyParser() {
    super(new Alt(
                  new NullParser(),
                  new StringParser(),
                  new LongParser(),
                  new BooleanParser(),
                  new FObjectParser()));
  }
}
