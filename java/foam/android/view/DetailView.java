package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.LinearLayout;

import foam.android.core.AttributeUtils;
import foam.core.HasX;
import foam.core.X;

/**
 * A fairly thin wrapper around {@link LinearLayout}, used for FOAM's DetailView.
 *
 * Implements {@link HasX} so that it can provide a context for its children.
 */
public class DetailView extends LinearLayout implements HasX {
  protected X x_;
  public X X() {
    return x_;
  }
  public void X(X x) {
    x_ = x;
  }


  public DetailView(Context context) {
    super(context);
    setOrientation(VERTICAL);
  }
  public DetailView(Context context, AttributeSet attrs) {
    super(context, attrs);
    if (AttributeUtils.find(attrs, "orientation") == null) {
      setOrientation(VERTICAL);
    }
  }
}
