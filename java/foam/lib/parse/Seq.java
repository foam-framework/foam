package foam.lib.parse;

public class Seq implements Parser {
  private Parser[] parsers;

  public Seq(Parser... args) {
    parsers = args;
  }

  public PStream parse(PStream ps, ParserContext x) {
    Object[] values = new Object[parsers.length];

    for ( int i = 0 ; i < parsers.length ; i++ ) {
      ps = parsers[i].parse(ps, x);
      if ( ps == null ) return null;
      values[i] = ps.value();
    }

    return ps.setValue(values);
  }
}
