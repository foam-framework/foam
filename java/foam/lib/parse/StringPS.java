package foam.lib.parse;

public class StringPS implements PStream {
  private Reference<String> str;
  private int pos;

  public StringPS() {
    this(new Reference<String>());
  }

  public StringPS(Reference<String> s) {
    this(s, 0);
  }

  public StringPS(Reference<String> s, int p) {
    this(s, p, null);
  }

  public StringPS(Reference<String> s, int p, Object value) {
    str = s;
    pos = p;
    value_ = value;
  }

  public void setString(String s) {
    str.set(s);
  }

  public char head() {
    return str.get().charAt(pos);
  }

  public boolean valid() {
    return pos < str.get().length();
  }

  private StringPS tail_ = null;
  public PStream tail() {
    if ( tail_ == null ) tail_ = new StringPS(str, pos + 1);
    return tail_;
  }

  private Object value_ = null;
  public Object value() {
    return value_;
  }

  public PStream setValue(Object value) {
    return new StringPS(str, pos, value);
  }

  public String substring(PStream end) {
    StringPS endps = (StringPS)end;

    return str.get().substring(pos, endps.pos);
  }
}
