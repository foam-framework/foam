package foam.core;

/**
 * Interface for objects which can be notified when a {@link Property} changes.
 */
public interface PropertyChangeListener<T> {
  void propertyChange(PropertyChangeEvent<T> event);
}
