package foam.lib.parse;

import java.util.ArrayList;

public class Repeat implements Parser{
  private Parser p;
  private Parser delim;
  private int min;
  private int max;

  public Repeat(Parser parser) {
    this(parser, null);
  }

  public Repeat(Parser parser, Parser delimiter) {
    this(parser, delimiter, -1, -1);
  }

  public Repeat(Parser parser, Parser delimiter, int minimum) {
    this(parser, delimiter, minimum, -1);
  }

  public Repeat(Parser parser, Parser delimiter, int minimum, int maximum) {
    p = parser;
    delim = delimiter;
    min = minimum;
    max = maximum;
  }

  public PStream parse(PStream ps, ParserContext x) {
    ArrayList values = new ArrayList();
    PStream result;

    for ( int i = 0 ; max == -1 || i < max ; i++ ) {
      if ( delim != null && values.size() != 0 ) {
        result = delim.parse(ps, x);
        if ( result == null ) break;
        ps = result;
      }

      result = p.parse(ps, x);
      if ( result == null ) break;

      values.add(result.value());
      ps = result;
    }

    if ( min != -1 && values.size() < min ) return null;

    return ps.setValue(values.toArray());
  }
}
