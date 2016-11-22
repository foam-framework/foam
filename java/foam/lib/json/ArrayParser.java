package foam.lib.json;

import foam.lib.parse.*;

public class ArrayParser extends ProxyParser {
  public ArrayParser() {
    super(new Seq1(3,
                   new Whitespace(),
                   new Literal("["),
                   new Whitespace(),
                   new Repeat(
                              new AnyParser(),
                              new Seq0(new Whitespace(),
                                       new Literal(","),
                                       new Whitespace())),
                   new Whitespace(),
                   new Literal("]")));
  }
}
