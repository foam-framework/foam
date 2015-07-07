package foam.android.view;

import android.content.Context;
import android.view.View;
import android.widget.LinearLayout;

import java.util.HashMap;
import java.util.Map;

import foam.core.FObject;
import foam.core.Model;
import foam.core.Property;

/**
 * Default FOAM DetailView: given any Model, generates a basic view of its properties.
 */
public class DetailView extends LinearLayout {
  private Model model;
  private boolean childViewsBuilt = false;
  private Map<String, PropertyView> propertyViews;

  public DetailView(Context context) {
    super(context);
    setOrientation(VERTICAL);
    propertyViews = new HashMap<>();
  }
  public DetailView(Context context, Model model) {
    this(context);
    this.model = model;
  }
  public DetailView(Context context, FObject obj) {
    this(context, obj.model(), obj);
  }

  public DetailView(Context context, Model model, FObject obj) {
    this(context);
    this.model = model;
    setData(obj);
  }

  public void setModel(Model model) {
    this.model = model;
  }

  public void maybeBuildChildViews() {
    if (childViewsBuilt) return;
    childViewsBuilt = true;

    // TODO(braden): Handle hidden properties.
    for (Property p : model.getProperties()) {
      PropertyView pView = p.createView(getContext());
      propertyViews.put(p.getName(), pView);
      addView((View) pView);
    }
  }

  public void setData(FObject obj) {
    maybeBuildChildViews();
    bindData(obj);
  }
  private void bindData(FObject obj) {
    for (Property p : model.getProperties()) {
      PropertyView pView = propertyViews.get(p.getName());
      pView.setValue(p.createValue(obj));
    }
  }
}
