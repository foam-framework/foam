package foam.android.core;

import android.content.Context;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.util.AttributeSet;
import android.view.View;

import java.util.LinkedList;
import java.util.List;

import foam.android.view.LayoutFactory;
import foam.android.view.ViewBridge;
import foam.core.EmptyX;
import foam.core.HasX;
import foam.core.X;

/**
 *
 */
public class FOAMActionBarActivity extends ActionBarActivity implements HasX {
  protected X x_ = EmptyX.instance();
  public X X() {
    return x_;
  }
  public void X(X x) {
    x_ = x;
  }

  @Override
  public void onCreate(Bundle bundle) {
    x_ = x_.put("propertyViews", new LinkedList<ViewBridge>());
    super.onCreate(bundle);
  }

  @Override
  public void onDestroy() {
    List<ViewBridge> list = (List<ViewBridge>) x_.get("propertyViews");
    for (ViewBridge v : list) {
      v.destroy();
    }
    super.onDestroy();
  }

  @Override
  public View onCreateView(View parent, String name, Context context, AttributeSet attrs) {
    View ret = LayoutFactory.tryToCreateFoamView(parent, name, context, attrs);
    if (ret != null) return ret;
    else return super.onCreateView(parent, name, context, attrs);
  }
}
