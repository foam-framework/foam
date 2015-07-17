package foam.core;

/**
 * Interface for objects (especially {@link FObject}) which support property change notifications.
 */
public interface PropertyChangeSupport {
  <T> void addPropertyChangeListener(Property<T> prop, PubSubListener<ValueChangeEvent<T>> listener);
  <T> void removePropertyChangeListener(Property<T> prop, PubSubListener<ValueChangeEvent<T>> listener);
  <T> void firePropertyChange(Property<T> prop, T oldValue, T newValue);
}
