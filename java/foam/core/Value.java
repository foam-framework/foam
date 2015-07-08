package foam.core;

/**
 * Basic interface for FOAM Values.
 */
public interface Value<T> {
  T get();
  void set(T newValue);
  void addListener(PropertyChangeListener<T> listener);
  void removeListener(PropertyChangeListener<T> listener);
}
