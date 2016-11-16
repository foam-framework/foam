package foam.lib.parse;

public class ProxyParser implements Parser {
  private Parser delegate;

  public ProxyParser(Parser d) {
    delegate = d;
  }

  public PStream parse(PStream ps, ParserContext x) {
    return delegate.parse(ps, x);
  }
}
