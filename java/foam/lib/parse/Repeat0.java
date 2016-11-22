package foam.lib.parse;

import java.util.ArrayList;

public class Repeat0 implements Parser {
  private Parser p;
  private Parser delim;
  private int min;
  private int max;

  public Repeat0(Parser parser) {
    this(parser, null);
  }

  public Repeat0(Parser parser, Parser delimiter) {
    this(parser, delimiter, -1, -1);
  }

  public Repeat0(Parser parser, Parser delimiter, int minimum) {
    this(parser, delimiter, minimum, -1);
  }

  public Repeat0(Parser parser, Parser delimiter, int minimum, int maximum) {
    p = parser;
    delim = delimiter;
    min = minimum;
    max = maximum;
  }

  public PStream parse(PStream ps, ParserContext x) {
    boolean first = true;
    PStream result;
    int i;

    for ( i = 0 ; max == -1 || i < max ; i++ ) {
      if ( delim != null && ! first ) {
        result = delim.parse(ps, x);
        if ( result == null ) break;
        ps = result;
      }

      result = p.parse(ps, x);
      if ( result == null ) break;
      ps = result;
      first = false;
    }

    if ( min != -1 && i < min ) return null;

    return ps;
  }
}
