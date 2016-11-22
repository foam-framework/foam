package foam.lib.parse;

public class NotChar implements Parser {
  private char ch;
  public NotChar(char c) {
    ch = c;
  }

  public PStream parse(PStream ps, ParserContext x) {
    return ps.valid() && ps.head() != ch ? ps.tail().setValue(ps.head()) : null;
  }
}
