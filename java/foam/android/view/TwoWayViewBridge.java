package foam.android.view;

import android.view.View;

import foam.core.Value;
import foam.core.ValueChangeEvent;

/**
 * Abstract base class for two-value binding FOAM {@link Value}s to Android {@link View}s.
 *
 * Subclasses must construct {@link #view} and implement {@link #updateViewFromValue()}.
 *
 * Subclasses  must also arrange, via some listener or other, to call
 * {@link #updateValueFromView(Object)} when the {@link View}'s data changes.
 */
public abstract class TwoWayViewBridge<V extends View, T> extends BaseViewBridge<V, T> {
  private boolean feedback = false;

  public void updateValueFromView(T newValue) {
    feedback = true;
    value.set(newValue);
    feedback = false;
  }

  public void eventOccurred(String[] topic, ValueChangeEvent<T> event) {
    if (!feedback) updateViewFromValue();
  }
}
