package foam.lib.json;

import foam.lib.parse.*;

public class LongParser implements Parser {
  public PStream parse(PStream ps, ParserContext x) {
    long n = 0;

    boolean negate = false;

    if ( ! ps.valid() ) return null;

    char c = ps.head();

    if ( c == '-' ) {
      negate = true;
      ps = ps.tail();
      if ( ! ps.valid() ) return null;
      c = ps.head();
    }

    if ( Character.isDigit(c) ) n = Character.digit(c, 10);
    else return null;

    ps = ps.tail();

    while ( ps.valid() ) {
      c = ps.head();
      if ( Character.isDigit(c) ) {
        n *= 10;
        n += Character.digit(c, 10);
      } else {
        break;
      }
      ps = ps.tail();
    }

    if ( negate ) n *= -1;

    return ps.setValue(n);
  }
}
