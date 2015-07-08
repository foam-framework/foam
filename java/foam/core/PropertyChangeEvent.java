package foam.core;

/**
 * Property change event object, with the target {@link FObject}, relevant {@link Property} and the
 * old and new values.
 */
public class PropertyChangeEvent<T> {
  private FObject obj;
  private Property prop;
  private T oldValue;
  private T newValue;

  public PropertyChangeEvent(FObject obj, Property prop, T oldValue, T newValue) {
    this.obj = obj;
    this.prop = prop;
    this.oldValue = oldValue;
    this.newValue = newValue;
  }

  public FObject getTarget() {
    return obj;
  }

  public Property getProperty() {
    return prop;
  }

  public T getOldValue() {
    return oldValue;
  }

  public T getNewValue() {
    return newValue;
  }
}
