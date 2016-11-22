package foam.lib.parse;

public class Seq1 implements Parser {
  private Parser[] parsers;
  private int index;

  public Seq1(int i, Parser... args) {
    parsers = args;
    index = i;
  }

  public PStream parse(PStream ps, ParserContext x) {
    Object value = null;

    for ( int i = 0 ; i < parsers.length ; i++ ) {
      ps = parsers[i].parse(ps, x);
      if ( ps == null ) return null;
      if ( i == index ) value = ps.value();
    }

    return ps.setValue(value);
  }
}
