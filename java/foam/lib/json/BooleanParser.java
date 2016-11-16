package foam.lib.json;

import foam.lib.parse.*;

public class BooleanParser extends ProxyParser {
  public BooleanParser() {
    super(new Alt(
                  new Literal("true", true),
                  new Literal("false", false)));
  }
}
