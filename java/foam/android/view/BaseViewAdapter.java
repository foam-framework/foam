package foam.android.view;

import android.view.View;

import foam.core.PropertyChangeEvent;
import foam.core.PropertyChangeListener;
import foam.core.Value;

/**
 * Abstract base class for FOAM's Value-View adapters.
 */
public abstract class BaseViewAdapter<V extends View> implements PropertyChangeListener, PropertyView {
  protected V view;
  protected Value value;

  public View getView() {
    return view;
  }

  public void setValue(Value v) {
    if (value != null) value.removeListener(this);
    value = v;
    value.addListener(this);
    updateViewFromValue();
  }

  protected abstract void updateViewFromValue();

  public void propertyChange(PropertyChangeEvent event) {
    updateViewFromValue();
  }
}
