package foam.core;

/**
 * Interface for objects (especially {@link FObject}) which support property change notifications.
 */
public interface PropertyChangeSupport {
  void addPropertyChangeListener(Property prop, PropertyChangeListener listener);
  void removePropertyChangeListener(Property prop, PropertyChangeListener listener);
  void firePropertyChange(Property prop, Object oldValue, Object newValue);
}
