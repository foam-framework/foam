package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.widget.FrameLayout;

import foam.core.HasX;
import foam.core.X;

/**
 * Container for a single child {@link View}, that {@link HasX}.
 *
 * That is, it provides a FOAM X context to its children.
 */
public class XView extends FrameLayout implements HasX {
  protected X x_;
  public X X(){ return x_; }
  public void X(X x) { x_ = x; }

  public XView(Context context) {
    super(context);
  }
  public XView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }
  public XView(Context context, AttributeSet attrs, int style) {
    super(context, attrs, style);
  }
}
