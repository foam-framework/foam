package foam.lib.parse;

public class Optional implements Parser {
  private Parser p;
  public Optional(Parser parser) {
    p = parser;
  }

  public PStream parse(PStream ps, ParserContext x) {
    PStream ret = p.parse(ps, x);
    if ( ret != null ) return ret;
    return ps.setValue(null);
  }
}
