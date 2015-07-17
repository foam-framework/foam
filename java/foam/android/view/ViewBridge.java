package foam.android.view;

import android.view.View;

import foam.core.HasX;
import foam.core.Value;

/**
 * Interface for Views that display a FOAM Property.
 */
public interface ViewBridge<T> extends HasX {
  View getView();
  Value<T> getValue();
  void setValue(Value<T> v);
  void destroy();
}
