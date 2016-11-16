package foam.lib.parse;

public class Seq0 implements Parser {
  private Parser[] parsers;

  public Seq0(Parser... args) {
    parsers = args;
  }

  public PStream parse(PStream ps, ParserContext x) {
    for ( int i = 0 ; i < parsers.length ; i++ ) {
      ps = parsers[i].parse(ps, x);
      if ( ps == null ) return null;
    }

    return ps;
  }
}
