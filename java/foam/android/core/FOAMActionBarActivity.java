package foam.android.core;

import android.content.Context;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.util.AttributeSet;
import android.view.View;

import java.util.LinkedList;
import java.util.List;

import foam.android.view.LayoutFactory;
import foam.android.view.PropertyView;
import foam.core.EmptyX;
import foam.core.HasX;
import foam.core.X;

/**
 *
 */
public class FOAMActionBarActivity extends ActionBarActivity implements HasX {
  protected X x_ = EmptyX.instance();
  public X getX() {
    return x_;
  }
  public void setX(X x) {
    x_ = x;
  }

  @Override
  public void onCreate(Bundle bundle) {
    x_ = x_.put("propertyViews", new LinkedList<PropertyView>());
    super.onCreate(bundle);
  }

  @Override
  public void onDestroy() {
    List<PropertyView> list = (List<PropertyView>) x_.get("propertyViews");
    for (PropertyView v : list) {
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
