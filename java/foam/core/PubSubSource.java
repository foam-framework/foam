package foam.core;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Base class that implements PubSub in a generic way.
 *
 * Inherited by {@link AbstractFObject}, but it can be used standalone too.
 */
public class PubSubSource implements PubSub {
  public static final String ANY = "*";
  private PubSubTopics topics = new PubSubTopics();

  @Override
  public void subscribe(String[] topic, PubSubListener listener) {
    topics.addListener(topic, 0, listener);
  }

  @Override
  public void unsubscribe(String[] topic, PubSubListener listener) {
    topics.removeListener(topic, 0, listener);
  }

  @Override
  public void publish(String[] topic, Object event) {
    topics.fireListeners(topic, 0, event);
  }

  @Override
  public void unsubscribeAll() {
    topics = new PubSubTopics();
  }

  private static class PubSubTopics {
    private Map<String, PubSubTopics> subtopics;
    private List<PubSubListener> listeners;

    public void addListener(String[] topic, int index, PubSubListener listener) {
      if (index < topic.length) {
        String t = topic[index];
        if (subtopics == null) subtopics = new HashMap<>();
        if (! subtopics.containsKey(t)) {
          subtopics.put(t, new PubSubTopics());
        }
        PubSubTopics sub = subtopics.get(t);
        sub.addListener(topic, index + 1, listener);
      } else {
        if (listeners == null) {
          listeners = new LinkedList<>();
        }
        listeners.add(listener);
      }
    }

    public void removeListener(String[] topic, int index, PubSubListener listener) {
      if (index < topic.length) {
        if (subtopics == null) return;
        String t = topic[index];
        if (subtopics.containsKey(t)) {
          subtopics.get(t).removeListener(topic, index + 1, listener);
        }
      } else {
        if (listeners != null) listeners.remove(listener);
      }
    }

    public void fireListeners(String[] topic, int index, Object event) {
      // Fire any inner listeners, and then my own listeners.
      if (index < topic.length && subtopics != null && subtopics.containsKey(topic[index])) {
        subtopics.get(topic[index]).fireListeners(topic, index + 1, event);
      }

      // Call the listeners for this specific topic.
      if (index >= topic.length && listeners != null) {
        for (PubSubListener l : listeners) {
          l.eventOccurred(topic, event);
        }
      }

      // And if there's an ANY topic, call that too.
      if (subtopics != null && subtopics.containsKey(ANY)) {
        subtopics.get(ANY).fireListeners(topic, 100000, event);
      }
    }
  }
}
