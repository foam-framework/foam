package foam.core;

/**
 * Interface for objects which can be notified when a {@link Property} changes.
 */
public interface PropertyChangeListener {
  void propertyChange(PropertyChangeEvent event);
}
