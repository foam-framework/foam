package foam.lib.parse;

public class Alt implements Parser {
  private Parser[] parsers;

  public Alt(Parser... args) {
    parsers = args;
  }

  public PStream parse(PStream ps, ParserContext x) {
    for ( int i = 0 ; i < parsers.length ; i++ ) {
      PStream ret = parsers[i].parse(ps, x);
      if ( ret != null ) return ret;
    }
    return null;
  }
}
