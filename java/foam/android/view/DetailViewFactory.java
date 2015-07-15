package foam.android.view;

import android.content.Context;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import foam.core.Model;

/**
 * Factory for {@link DetailViewBridge}s that inflates from a {@link String}.
 *
 * That input string can take the form either of <code>"@layout/foobar"</code>
 * or <code>"foo.bar.SomeView"</code> giving a class name. If the string is
 * null or not understood, the factory builds {@link DetailViewBridge}s.
 *
 * The <code>"@layout/foobar"</code> form creates a DetailView whose inner
 * {@link View} is constructed using the provided layout instead of the default.
 *
 * The <code>"foo.bar.SomeView"</code> form just loads that class directly; it's
 * expected to implement {@link ViewBridge}.
 */
public class DetailViewFactory {
  private static final String LOG_TAG = "DetailViewFactory";

  private Model model;
  private String viewSpec;
  private Class bridgeClass = DetailViewBridge.class;
  private int layout = -1;
  private boolean layoutMode = false;

  public DetailViewFactory(String viewSpec, Model model) {
    this.viewSpec = viewSpec;
    this.model = model;
    if (viewSpec != null && viewSpec.startsWith("@layout/")) {
      layoutMode = true;
    } else if (viewSpec != null) {
      try {
        bridgeClass = Class.forName(viewSpec);
      } catch(ClassNotFoundException e) {
        Log.e(LOG_TAG, "Could not find class \"" + viewSpec +"\".");
      }
    }
  }

  public ViewBridge create(ViewGroup parent) {
    Context context = parent.getContext();
    if (layoutMode) {
      if (layout < 0) {
        // Still need to inflate the layout.
        layout = context.getResources().getIdentifier(viewSpec.substring(8), "layout",
            context.getPackageName());
      }

      DetailViewBridge v = new DetailViewBridge(context, layout, parent);
      v.setModel(model);
      return v;
    } else {
      try {
        return (ViewBridge) bridgeClass.getConstructor(Context.class).newInstance(context);
      } catch(Exception e) {
        Log.e(LOG_TAG, "Error constructing an instance of \"" + bridgeClass.getName() +"\".");
        return null;
      }
    }
  }
}
