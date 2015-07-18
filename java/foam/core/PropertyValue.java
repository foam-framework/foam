package foam.core;

/**
 * An object-oriented pointer, essentially an FObject-Property pair.
 *
 * Generally created in the generated code.
 */
public class PropertyValue<T> implements Value<T> {
  private FObject obj;
  private Property<T> prop;

  public PropertyValue(FObject obj, Property<T> prop) {
    this.obj = obj;
    this.prop = prop;
  }

  public T get() {
    return prop.get(obj);
  }
  public void set(T value) {
    prop.set(obj, value);
  }

  public PropertyChangeSupport getTarget() {
    return obj;
  }
  public Property<T> getProperty() {
    return prop;
  }

  public void addListener(PubSubListener<ValueChangeEvent<T>> listener) {
    obj.addPropertyChangeListener(prop, listener);
  }
  public void removeListener(PubSubListener<ValueChangeEvent<T>> listener) {
    obj.removePropertyChangeListener(prop, listener);
  }
}
