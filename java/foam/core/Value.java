package foam.core;

/**
 * Basic interface for FOAM Values.
 */
public interface Value<T> {
  T get();
  void set(T newValue);
  void addListener(PubSubListener<ValueChangeEvent<T>> listener);
  void removeListener(PubSubListener<ValueChangeEvent<T>> listener);
}
