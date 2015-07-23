package foam.android.core;

import android.content.Context;
import android.content.ContextWrapper;

import foam.android.view.DetailViewBridge;
import foam.android.view.LayoutFactory;
import foam.core.HasX;
import foam.core.X;

/**
 * An Android {@link Context} augmented with a FOAM {@link X} context.
 *
 * Useful for constructing Views within a FOAM context, by a {@link DetailViewBridge} or the
 * {@link LayoutFactory}.
 */
public class XContext extends ContextWrapper implements HasX {
  protected X x_;
  public X X() { return x_; }
  public void X(X x) { x_ = x; }

  public XContext(Context base, X x) {
    super(base);
    X(x);
  }
}

