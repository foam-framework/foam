package foam.core;

/**
 * An object-oriented pointer, essentially an FObject-Property pair.
 *
 * Generally created in the generated code.
 */
public class Value {
  private FObject obj;
  private Property prop;

  public Value(FObject obj, Property prop) {
    this.obj = obj;
    this.prop = prop;
  }

  public Object get() {
    return prop.get(obj);
  }
  public void set(Object value) {
    Object old = get();
    prop.set(obj, value);
  }

  public PropertyChangeSupport getTarget() {
    return obj;
  }
  public Property getProperty() {
    return prop;
  }

  public void addListener(PropertyChangeListener listener) {
    obj.addPropertyChangeListener(prop, listener);
  }
  public void removeListener(PropertyChangeListener listener) {
    obj.removePropertyChangeListener(prop, listener);
  }
}
