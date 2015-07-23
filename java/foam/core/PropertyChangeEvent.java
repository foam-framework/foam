package foam.core;

/**
 * Property change event object, with the target {@link FObject}, relevant {@link Property} and the
 * old and new values.
 */
public class PropertyChangeEvent<T> extends ValueChangeEvent<T> {
  private FObject obj;
  private Property prop;

  public PropertyChangeEvent(FObject obj, Property prop, T oldValue, T newValue) {
    super(oldValue, newValue);
    this.obj = obj;
    this.prop = prop;
  }

  public FObject getTarget() {
    return obj;
  }

  public Property getProperty() {
    return prop;
  }
}
