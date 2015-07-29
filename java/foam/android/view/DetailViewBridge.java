package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import foam.android.core.AttributeUtils;
import foam.android.core.XContext;
import foam.core.FObject;
import foam.core.Model;
import foam.core.Property;
import foam.core.SimpleValue;
import foam.core.ValueChangeEvent;
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
  protected Map<String, ViewBridge> propertyViewMap;
  protected List<ViewBridge> propertyViews;

  protected Context context;
  protected int layout = -1;
  protected ViewGroup parentView;

  protected boolean needChildBinding = false;

  public X X() {
    return x_;
  }
  public void X(X x) {
    x_ = x;
  }

  public DetailViewBridge(Context context) {
    setup();
    view = buildView(context, null);
  }
  public DetailViewBridge(Context context, AttributeSet attrs) {
    setup();
    view = buildView(context, attrs);
  }

  private ViewGroup buildView(Context context, AttributeSet attrs) {
    LinearLayout v = attrs == null ? new LinearLayout(context) : new LinearLayout(context, attrs);
    if (AttributeUtils.find(attrs, "orientation") == null) {
      v.setOrientation(LinearLayout.VERTICAL);
    }
    ViewGroup.LayoutParams lp = v.getLayoutParams();
    if (lp == null) {
      v.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
    } else {
      lp = new ViewGroup.LayoutParams(lp.width, lp.height);
      boolean changed = false;
      if (AttributeUtils.find(attrs, "layout_height") == null) {
        lp.height = ViewGroup.LayoutParams.WRAP_CONTENT;
        changed = true;
      }
      if (AttributeUtils.find(attrs, "layout_width") == null) {
        lp.width = ViewGroup.LayoutParams.MATCH_PARENT;
        changed = true;
      }
      if (changed) v.setLayoutParams(lp);
    }
    return v;
  }

  public DetailViewBridge(Context context, int layout, ViewGroup parent) {
    setup();
    this.context = context;
    this.layout = layout;
    parentView = parent;
    tryToInflateView();
  }

  private void tryToInflateView() {
    if (view != null) return;
    if (X() == null) return;
    if (layout == -1) return;
    if (parentView == null) return;

    X y = X().put("model", model).put("data", value).put("propertyViews", propertyViews);
    childViewsBuilt = true; // Already built the child views.
    needChildBinding = true;
    Context wrapped = new XContext(context, y);
    LayoutInflater lf = LayoutInflater.from(context);
    lf = lf.cloneInContext(wrapped);
    view = (ViewGroup) lf.inflate(layout, parentView, false /* attachToRoot */);
  }

  public View getView() {
    if (view == null) {
      tryToInflateView();
      if (view == null) {
        Log.e("DetailViewBridge", "Need to set X before inflating a layout.");
        return null;
      }
    }
    return super.getView();
  }

  private void setup() {
    propertyViews = new LinkedList<>();
    propertyViewMap = new HashMap<>();
    setValue(new SimpleValue<FObject>(null));
  }

  public void setModel(Model model) {
    this.model = model;
  }

  public void maybeBuildChildViews() {
    if (childViewsBuilt) return;
    childViewsBuilt = true;

    for (Property p : model.getProperties()) {
      if (p.isHidden()) continue;
      ViewBridge pView = PropertyViewFactory.create(p, view.getContext());
      pView.X(X());
      propertyViewMap.put(p.getName(), pView);
      view.addView(pView.getView());
    }
  }

  /**
   * Called when a custom layout has been used to inflate this DetailView's contents.
   *
   * When that is the case, arbitrary views can be bound to properties inside. They will have been
   * added to propertyViews, so we iterate them, check their {@link X}'s for <code>"prop"</code> and
   * add them to {@link #propertyViewMap} so that their values will be updated on {@link #setData}.
   */
  protected void bindChildViews() {
    for (ViewBridge b : propertyViews) {
      Property prop = (Property) b.X().get("prop");
      if (prop != null) {
        propertyViewMap.put(prop.getName(), b);
      }
    }

    needChildBinding = false;
  }

  @Override
  public void updateViewFromValue() {
    setData(value.get());
  }

  @Override
  public void destroy() {
    for (ViewBridge vb : propertyViews) {
      vb.destroy();
    }
  }

  @Override
  public void eventOccurred(String[] topic, ValueChangeEvent<FObject> event) {
    setData(event.getNewValue());
  }

  public void setData(FObject obj) {
    if (obj == null) return;
    setModel(obj.model());
    tryToInflateView();
    maybeBuildChildViews();
    if (needChildBinding) bindChildViews();
    bindData(obj);
  }
  private void bindData(FObject obj) {
    if (obj == null) {
      for (ViewBridge b : propertyViews) {
        b.getView().setVisibility(View.GONE);
      }
    } else {
      for (Property p : model.getProperties()) {
        ViewBridge pView = propertyViewMap.get(p.getName());
        if (pView != null) {
          pView.setValue(p.createValue(obj));
          pView.getView().setVisibility(View.VISIBLE);
        }
      }
    }
  }
}
