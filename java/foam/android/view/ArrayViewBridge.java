package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.widget.LinearLayout;

import java.util.ArrayList;
import java.util.List;

import foam.android.core.AttributeUtils;
import foam.core.FObject;
import foam.core.HasX;
import foam.core.SimpleValue;
import foam.core.X;

/**
 * Wrapper for viewing lists of {@link FObject}s. Won't work with other types.
 */
public class ArrayViewBridge extends OneWayViewBridge<LinearLayout, List<FObject>> {
  private String rowView;
  private DetailViewFactory factory;
  private List<ViewBridge> bridges;

  public ArrayViewBridge(Context context) {
    this(context, null);
  }
  public ArrayViewBridge(Context context, AttributeSet attrs) {
    view = attrs == null ? new LinearLayout(context) : new LinearLayout(context, attrs);

    String orientation = AttributeUtils.find(attrs, "orientation");
    if (orientation == null) view.setOrientation(LinearLayout.VERTICAL);

    // Look for a rowView setting.
    rowView = AttributeUtils.find(attrs, "row_view");
    bridges = new ArrayList<>();
  }

  @Override
  protected void updateViewFromValue() {
    view.removeAllViews();
    for (ViewBridge vb : bridges) {
      vb.destroy();
    }
    bridges.clear();

    List<FObject> list = value.get();
    if (list == null || list.size() == 0) return;
    if (factory == null) factory = new DetailViewFactory(rowView, list.get(0).model());
    for (FObject obj : list) {
      ViewBridge bridge = factory.create(view);
      X y = X().put("data", obj);
      bridge.X(y);
      bridge.setValue(new SimpleValue(obj));
      View v = bridge.getView();
      view.addView(v);
      if (y.getValue("selection") != null) {
        v.setOnClickListener(new ArrayClickListener(y, obj));
      }
    }
  }

  private class ArrayClickListener implements View.OnClickListener, HasX {
    private FObject object;
    private X x_;
    public X X() {
      return x_;
    }
    public void X(X x) {
      x_ = x;
    }
    public ArrayClickListener(X x, FObject obj) {
      X(x);
      object = obj;
    }

    @Override
    public void onClick(View v) {
      X().getValue("selection").set(object);
    }
  }
}
