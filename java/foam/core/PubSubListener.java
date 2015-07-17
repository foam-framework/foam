package foam.core;

/**
 * Base interface for topic listeners.
 */
public interface PubSubListener<T> {
  void eventOccurred(String[]topic, T event);
}
