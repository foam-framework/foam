package foam.lib.parse;

public class Reference<T> {
  private T value_;
  public Reference(T value) {
    value_ = value;
  }

  public Reference() {
    value_ = null;
  }

  public T get() {
    return value_;
  }

  public void set(T value) {
    value_ = value;
  }
}
