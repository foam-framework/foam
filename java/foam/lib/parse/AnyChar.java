package foam.lib.parse;

public class AnyChar implements Parser {
  public PStream parse(PStream ps, ParserContext x) {
    if ( ps.valid() ) return ps.tail().setValue(ps.head());
    return null;
  }
}
