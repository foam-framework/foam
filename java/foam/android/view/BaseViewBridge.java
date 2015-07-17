package foam.android.view;

import android.annotation.SuppressLint;
import android.os.Build;
import android.view.View;

import java.util.concurrent.atomic.AtomicInteger;

import foam.core.PropertyValue;
import foam.core.PubSubListener;
import foam.core.Value;
import foam.core.ValueChangeEvent;
import foam.core.X;

/**
 * Abstract base class for FOAM's Value-View adapters.
 */
public abstract class BaseViewBridge<V extends View, T> implements ViewBridge<T>, PubSubListener<ValueChangeEvent<T>> {
  protected static final AtomicInteger nextGeneratedId = new AtomicInteger(1);
  protected V view;
  protected Value<T> value;
  protected X x_;

  public X X() {
    return x_;
  }
  public void X(X x) {
    x_ = x;
  }

  public View getView() {
    if (view == null) return null;

    if (view.getId() == View.NO_ID) {
      view.setId(generateViewId());
    }

    return view;
  }

  public Value<T> getValue() {
    return value;
  }
  public void setValue(Value<T> v) {
    if (value != null) value.removeListener(this);
    value = v;
    value.addListener(this);
    updateViewFromValue();
  }

  protected String getLabel(Value v) {
    if (v instanceof PropertyValue || X().get("label") != null) {
      String label = (String) X().get("label");
      if (label == null) label = ((PropertyValue) v).getProperty().getLabel();
      return label;
    }
    return null;
  }

  @SuppressLint("NewApi")
  protected int generateViewId() {
    if (Build.VERSION.SDK_INT < 17) {
      while (true) {
        final int result = nextGeneratedId.get();
        int newValue = result + 1;
        if (newValue > 0x00FFFFFF)
          newValue = 1;
        if (nextGeneratedId.compareAndSet(result, newValue)) {
          return result;
        }
      }
    } else {
      return View.generateViewId();
    }
  }

  public void destroy() {
    if (value != null) value.removeListener(this);
  }

  protected abstract void updateViewFromValue();

  public void eventOccurred(String[] topic, ValueChangeEvent<T> event) {
    updateViewFromValue();
  }
}
