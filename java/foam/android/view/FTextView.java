package foam.android.view;

import android.content.Context;
import android.widget.TextView;

import foam.core.AbstractStringProperty;
import foam.core.PropertyChangeEvent;
import foam.core.PropertyChangeListener;
import foam.core.Value;
import foam.core.X;

/**
 * FOAM wrapper for Android's TextView.
 *
 * Expects either a {@link X} with "data" to be a {@link Value}, or {@link #setValue(Value)} to be
 * called with a {@link Value} for an {@link AbstractStringProperty}.
 */
public class FTextView extends TextView implements PropertyView, PropertyChangeListener {
  private Value value;
  public FTextView(Context context) {
    super(context);
  }

  public void setX(X x) {
    setValue((Value) x.get("data"));
  }
  public void setValue(Value v) {
    if (value != null) value.removeListener(this);
    value = v;
    v.addListener(this);
    setText((String) v.get());
  }

  public void propertyChange(PropertyChangeEvent event) {
    setText((String) event.getNewValue());
  }
}
