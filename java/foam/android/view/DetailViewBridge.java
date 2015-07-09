package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import java.util.HashMap;
import java.util.Map;

import foam.core.FObject;
import foam.core.Model;
import foam.core.Property;
import foam.core.PropertyChangeEvent;
import foam.core.SimpleValue;
import foam.core.X;

/**
 * Default FOAM DetailView: given any Model, generates a basic view of its properties.
 *
 * This is a reusable {@link ViewBridge}. The contained {@link View} can be anything, and its
 * data will be supplied as normal. Any ViewBridge inside the View that wants a
 *
 * You cannot change the type of the model!
 */
public class DetailViewBridge extends OneWayViewBridge<ViewGroup, FObject> {
  protected Model model;
  protected boolean childViewsBuilt = false;
  protected Map<String, ViewBridge> propertyViews;

  protected Context context;
  protected int layout;

  public X X() {
    return x_;
  }
  public void X(X x) {
    x_ = x;
  }

  public DetailViewBridge(Context context) {
    setup();
    view = new LinearLayout(context);
  }
  public DetailViewBridge(Context context, AttributeSet attrs) {
    setup();
    view = new LinearLayout(context, attrs);
  }

  public DetailViewBridge(Context context, int layout) {
    setup();
    this.context = context;
    tryToInflateView();
  }

  private void tryToInflateView() {
    if (X() == null) return;
    X y = X().put("data", value).put("propertyViews", propertyViews);
    childViewsBuilt = true; // Already built the child views.
    XView xv = new XView(context);
    xv.X(y);
    xv.addView(LayoutInflater.from(context).inflate(layout, view));
    view = xv;
  }

  public View getView() {
    if (view == null) {
      tryToInflateView();
      if (view == null) {
        Log.e("DetailViewBridge", "Need to set X before inflating a layout.");
        return null;
      }
    }
    return view;
  }

  private void setup() {
    propertyViews = new HashMap<>();
    setValue(new SimpleValue<FObject>(null));
  }

  public void setModel(Model model) {
    this.model = model;
  }

  public void maybeBuildChildViews() {
    if (childViewsBuilt) return;
    childViewsBuilt = true;

    // TODO(braden): Handle hidden properties.
    for (Property p : model.getProperties()) {
      ViewBridge pView = p.createView(view.getContext());
      propertyViews.put(p.getName(), pView);
      view.addView(pView.getView());
    }
  }

  @Override
  public void updateViewFromValue() {
    setData(value.get());
  }

  @Override
  public void destroy() {
    for (ViewBridge vb : propertyViews.values()) {
      vb.destroy();
    }
  }

  @Override
  public void propertyChange(PropertyChangeEvent<FObject> event) {
    setData(event.getNewValue());
  }

  public void setData(FObject obj) {
    if (obj == null) return;
    setModel(obj.model());
    maybeBuildChildViews();
    bindData(obj);
  }
  private void bindData(FObject obj) {
    for (Property p : model.getProperties()) {
      ViewBridge pView = propertyViews.get(p.getName());
      pView.setValue(p.createValue(obj));
    }
  }
}
