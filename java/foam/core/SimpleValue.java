package foam.core;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

/**
 * A standalone {@link Value}.
 *
 * Manages its own listeners. That means that two {@link SimpleValue}s of the same underlying
 * data have separate listeners! Be careful.
 */
public class SimpleValue<T> implements Value<T> {
  private static final String[] TOPIC = new String[] { "value" };
  protected T data = null;
  // TODO(braden): Switch to WeakReferences here to prevent memory leaks?
  protected List<PubSubListener<ValueChangeEvent<T>>> listeners;

  public SimpleValue() {
  }
  public SimpleValue(T obj) {
    set(obj);
  }

  @Override
  public T get() {
    return data;
  }

  @Override
  public void set(T newValue) {
    T old = data;
    data = newValue;
    maybeFireListeners(old, newValue);
  }

  @Override
  public void addListener(PubSubListener<ValueChangeEvent<T>> listener) {
    if (listeners == null) listeners = new LinkedList<>();
    listeners.add(listener);
  }

  @Override
  public void removeListener(PubSubListener<ValueChangeEvent<T>> listener) {
    if (listeners == null) return;
    Iterator<PubSubListener<ValueChangeEvent<T>>> it = listeners.iterator();
    while(it.hasNext()) {
      if (it.next() == listener) it.remove();
    }
    if (listeners.size() == 0) listeners = null;
  }

  private void maybeFireListeners(T old, T nu) {
    if (listeners != null && (old != null || nu != null) &&
        ((nu != null && !nu.equals(old)) || !old.equals(nu))) {
      ValueChangeEvent<T> event = new ValueChangeEvent<>(old, nu);
      for (PubSubListener<ValueChangeEvent<T>> p : listeners) {
        p.eventOccurred(TOPIC, event);
      }
    }
  }
}
