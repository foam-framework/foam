package foam.android.core;

import android.app.Activity;
import android.content.Context;
import android.util.AttributeSet;
import android.view.View;

import foam.android.view.LayoutFactory;
import foam.core.EmptyX;
import foam.core.HasX;
import foam.core.X;

public class FOAMActivity extends Activity implements HasX {
  protected X x_ = EmptyX.instance();
  public X X() {
    return x_;
  }
  public void X(X x) {
    x_ = x;
  }

  @Override
  public View onCreateView(View parent, String name, Context context, AttributeSet attrs) {
    View ret = LayoutFactory.tryToCreateFoamView(parent, name, context, attrs);
    if (ret != null) return ret;
    else return super.onCreateView(parent, name, context, attrs);
  }
}
