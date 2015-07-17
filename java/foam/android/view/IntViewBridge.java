package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.TextView;

/**
 * Wraps a {@link TextView} with conversion from an integer to a string.
 */
public class IntViewBridge extends OneWayViewBridge<TextView, Integer> {
  public IntViewBridge(Context context) {
    view = new TextView(context);
  }
  public IntViewBridge(Context context, AttributeSet attrs) {
    view = new TextView(context, attrs);
  }

  protected void updateViewFromValue() {
    view.setText(value.get().toString());
  }
}
