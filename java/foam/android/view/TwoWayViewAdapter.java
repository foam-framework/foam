package foam.android.view;

import android.view.View;

import foam.core.PropertyChangeEvent;
import foam.core.Value;

/**
 * Abstract base class for two-value binding FOAM {@link Value}s to Android {@link View}s.
 *
 * Subclasses must construct {@link #view} and implement {@link #updateViewFromValue()}.
 *
 * Subclasses  must also arrange, via some listener or other, to call
 * {@link #updateValueFromView(Object)} when the {@link View}'s data changes.
 */
public abstract class TwoWayViewAdapter<V extends View> extends BaseViewAdapter<V> {
  private boolean feedback = false;

  public void updateValueFromView(Object newValue) {
    feedback = true;
    value.set(newValue);
    feedback = false;
  }

  public void propertyChange(PropertyChangeEvent event) {
    if (!feedback) updateViewFromValue();
  }
}
