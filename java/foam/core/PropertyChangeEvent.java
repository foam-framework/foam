package foam.core;

/**
 * Property change event object, with the target {@link FObject}, relevant {@link Property} and the
 * old and new values.
 */
public class PropertyChangeEvent {
  private FObject obj;
  private Property prop;
  private Object oldValue;
  private Object newValue;

  public PropertyChangeEvent(FObject obj, Property prop, Object oldValue, Object newValue) {
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

  public Object getOldValue() {
    return oldValue;
  }

  public Object getNewValue() {
    return newValue;
  }
}
