package foam.core;

/**
 * Interface for objects that support pub/sub operations with multi-level topics.
 */
public interface PubSub {
  void subscribe(String[] topic, PubSubListener listener);
  void unsubscribe(String[] topic, PubSubListener listener);
  void unsubscribeAll();
  void publish(String[] topic, Object event);
}
