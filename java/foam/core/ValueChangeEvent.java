package foam.core;

/**
 * Fundamental event representing a single value of type <code>T</code> changing.
 */
public class ValueChangeEvent<T> {
  protected T oldValue;
  protected T newValue;

  public ValueChangeEvent(T oldValue, T newValue) {
    this.oldValue = oldValue;
    this.newValue = newValue;
  }

  public T getOldValue() {
    return oldValue;
  }
  public T getNewValue() {
    return newValue;
  }
}
