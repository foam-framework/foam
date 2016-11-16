package foam.lib.json;

import foam.lib.parse.*;

public class StringParser implements Parser {
  private char delim_;
  private char escape_;

  public StringParser() {
    escape_ = '\\';
  }


  public PStream parse(PStream ps, ParserContext x) {
    delim_ = ps.head();
    if ( delim_ != '"' && delim_ != '\'' ) {
      return null;
    }

    ps = ps.tail();
    char lastc = delim_;

    PStream start = ps;

    while ( ps.valid() ) {
      char c = ps.head();
      if ( c == delim_ && lastc != escape_ ) {
        break;
      }
      lastc = c;
      ps = ps.tail();
    }

    return ps.tail().setValue(start.substring(ps));
  }
}
