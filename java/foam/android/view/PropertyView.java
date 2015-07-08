package foam.android.view;

import android.view.View;

import foam.core.HasX;
import foam.core.Value;

/**
 * Interface for Views that display a FOAM Property.
 */
public interface PropertyView extends HasX {
  View getView();
  void setValue(Value v);
  void destroy();
}
