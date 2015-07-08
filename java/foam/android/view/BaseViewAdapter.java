package foam.android.view;

import android.view.View;

import foam.core.PropertyChangeEvent;
import foam.core.PropertyChangeListener;
import foam.core.Value;
import foam.core.X;

/**
 * Abstract base class for FOAM's Value-View adapters.
 */
public abstract class BaseViewAdapter<V extends View> implements PropertyChangeListener, PropertyView {
  protected V view;
  protected Value value;
  protected X x_;

  public X getX() {
    return x_;
  }
  public void setX(X x) {
    x_ = x;
  }

  public View getView() {
    return view;
  }

  public void setValue(Value v) {
    if (value != null) value.removeListener(this);
    value = v;
    value.addListener(this);
    updateViewFromValue();
  }

  public void destroy() {
    if (value != null) value.removeListener(this);
  }

  protected abstract void updateViewFromValue();

  public void propertyChange(PropertyChangeEvent event) {
    updateViewFromValue();
  }
}
