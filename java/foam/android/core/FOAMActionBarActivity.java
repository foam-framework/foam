package foam.android.core;

import android.os.Bundle;
import android.support.v4.view.LayoutInflaterCompat;
import android.support.v7.app.AppCompatActivity;

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
public abstract class FOAMActionBarActivity extends AppCompatActivity implements HasX {
  protected X x_ = EmptyX.instance();
  public X X() {
    return x_;
  }
  public void X(X x) {
    x_ = x;
  }

  @Override
  public void onCreate(Bundle bundle) {
    X(X().put("propertyViews", new LinkedList<ViewBridge>()));
    LayoutInflaterCompat.setFactory(getLayoutInflater(), new LayoutFactory(getDelegate()));
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
}
