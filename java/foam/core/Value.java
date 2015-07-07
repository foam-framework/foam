package foam.core;

/**
 * Basic interface for FOAM Values.
 */
public interface Value {
  Object get();
  void set(Object newValue);
  void addListener(PropertyChangeListener listener);
  void removeListener(PropertyChangeListener listener);
}
