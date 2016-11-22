package foam.lib.parse;

public class Not implements Parser {
  private Parser p;
  public Not(Parser parser) {
    p = parser;
  }

  public PStream parse(PStream ps, ParserContext x) {
    PStream ret = p.parse(ps, x);
    return ret != null ? null : ps;
  }
}
