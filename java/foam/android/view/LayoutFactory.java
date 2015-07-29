package foam.android.view;

import android.app.Activity;
import android.content.Context;
import android.support.v4.view.LayoutInflaterFactory;
import android.support.v7.app.AppCompatDelegate;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;
import android.widget.LinearLayout;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import foam.android.core.AttributeUtils;
import foam.android.core.XContext;
import foam.core.FObject;
import foam.core.HasX;
import foam.core.Model;
import foam.core.Property;
import foam.core.Relationship;
import foam.core.SimpleValue;
import foam.core.Value;
import foam.core.X;
import foam.dao.DAO;

/**
 * Should be installed in onCreate of all FOAM-friendly Activities.
 *
 * Knows how to turn FOAM tags into the appropriate View.
 */
public class LayoutFactory implements LayoutInflaterFactory {
  private static final String LOG_TAG = "FOAMLayoutFactory";
  private AppCompatDelegate appCompatDelegate;

  public LayoutFactory(AppCompatDelegate appCompatDelegate) {
    this.appCompatDelegate = appCompatDelegate;
  }

  public View onCreateView(View parent, String name, Context context, AttributeSet attrs) {
    View result = tryToCreateFoamView(parent, name, context, attrs);
    if (result == null) {
      result = appCompatDelegate.createView(parent, name, context, attrs);
    }
    return result;
  }

  /**
   * Turns a <code><foam.android.view.FOAMTagView ... /></code> into a {@link View}  and a FOAM
   * {@link ViewBridge}.
   *
   * There are several possible sets of paramters to give a FOAM XML tag. The correct forms are:
   * <ul>
   *   <li><code>prop</code> and <code>data</code> or <code>model</code></li>
   *   <li><code>relationship</code> and <code>data</code></li>
   *   <li><code>view</code> and optionally <code>data</code> (without <code>data</code>, it
   *     constructs the View without any bindings, which is fine for some standalone views.</li>
   *   <li><code>data</code> alone - constructs a default {@link DetailViewBridge}, a vertical
   *   {@link LinearLayout} of all {@link Property} objects on the model of the data.
   * </ul>
   * @param parent_ The {@link View} containing this tag.
   * @param name The tag name. Only <code>"foam.android.view.FoamTagView"</code> is accepted.
   * @param context The containing {@link Context}, generally an {@link Activity}.
   * @param attrs XML attributes object.
   * @return A {@link View} if the tag is recognized, and <code>null</code> otherwise.
   */
  public static View tryToCreateFoamView(View parent_, String name, Context context, AttributeSet attrs) {
    if (!name.equals("foam.android.view.FoamTagView")) return null;

    X x = null;
    if (context instanceof HasX) {
      x = ((HasX) context).X();
    } else {
      Log.w(LOG_TAG, "Failed to find a contextualized parent while inflating a <foam> tag - did you forget to extend FOAMActivity or implement HasX on your custom Activity?");
      return null;
    }

    // If we get down here, then we've got a context to work with.

    // There are a few cases for what to do, depending on what sort of <foam> tag we got.
    // See the documentation above for the possible values to supply. First step is to try to
    // retrieve all the relevant properties from the XML.
    String propName = AttributeUtils.find(attrs, "prop");
    String relName = AttributeUtils.find(attrs, "relationship");
    String modelName = AttributeUtils.find(attrs, "model");
    String dataName = AttributeUtils.find(attrs, "data");
    String viewName = AttributeUtils.find(attrs, "view");

    Object data = x.get(dataName == null ? "data" : dataName);
    if (propName != null && (data != null || modelName != null)) {
      ViewBridge b = buildViewForProperty(x, context, attrs, propName, dataName, modelName, viewName);
      return b == null ? null : b.getView();
    }

    if (relName != null && data != null) {
      ViewBridge b = buildViewForRelationship(x, context, attrs, data, relName, viewName);
      return b == null ? null : b.getView();
    }

    Value value = null;
    if (data instanceof Value) value = (Value) data;
    else value = new SimpleValue(data);

    Model model = null;
    if (modelName != null) {
      model = modelFromName(modelName);
    } else if (value.get() instanceof FObject) {
      model = ((FObject) value.get()).model();
    }

    X subX = x.put("data", value);
    subX = augmentContext(subX, attrs);

    XContext subcontext = new XContext(context, subX);
    ViewBridge replacement = null;
    if (viewName != null) {
      replacement = viewNameToViewBridge(viewName, subcontext, attrs);
    } else if (model != null) {
      DetailViewBridge dv = new DetailViewBridge(subcontext, attrs);
      dv.setModel(model);
      replacement = dv;
    }

    if (replacement == null) {
      Log.e(LOG_TAG, "Failed to create a view for a <foam> tag.");
      return null;
    }

    replacement.X(subX);
    replacement.setValue(value);
    View v = replacement.getView();
    return v;
  }

  private static ViewBridge buildViewForProperty(X x, Context context, AttributeSet attrs,
      String propName, String dataName, String modelName, String viewName) {
    Model model = null;
    Value value = null;
    X sub = augmentContext(x, attrs);
    if (modelName != null) {
      model = modelFromName(modelName);
      if (model == null) {
        Log.e(LOG_TAG, "Could not load model: " + modelName);
        return null;
      }
    } else {
      value = x.getValue(dataName == null ? "data" : dataName);
      Object rawObj = value.get();
      if (rawObj != null) model = ((FObject) rawObj).model();
    }

    if (model == null) {
      Object m = x.get("model");
      if (m != null && m instanceof Model)
        model = (Model) m;
    }

    if (model == null) {
      Log.e(LOG_TAG, "No data or model for <foam> tag with prop set. Provide foam:model or foam:data, or put model in the X context.");
      return null;
    }

    // Now we have both a property name and a Model, so we can create a view for the Property.
    Property p = model.getProperty(propName);
    if (p == null) {
      Log.e(LOG_TAG, "Could not find property \"" + propName + "\" on model \"" + model.getName() + "\"");
      return null;
    }

    if (value != null) {
      Object rawObj = value.get();
      if (rawObj instanceof FObject) {
        FObject data = (FObject) rawObj;
        value = p.createValue(data);
      } else {
        value = new SimpleValue(rawObj);
      }

      sub = sub.put("data", value);
    } else {
      value = new SimpleValue();
    }

    ViewBridge child = null;
    sub = sub.put("prop", p);
    XContext subcontext = new XContext(context, sub);
    if (viewName != null) {
      child = viewNameToViewBridge(viewName, subcontext, attrs);
      if (child == null) {
        Log.e(LOG_TAG, "Could not load view: " + viewName);
        return null;
      }
    } else {
      child = PropertyViewFactory.create(p, subcontext, attrs);
    }

    // Either way, we now have a child view. Set up the descendant context.
    List<ViewBridge> list = (List<ViewBridge>) x.get("propertyViews");
    if (list != null) {
      list.add(child);
    }

    child.X(sub);
    if (value != null) child.setValue(value);

    return child;
  }

  private static ViewBridge buildViewForRelationship(X x, Context context, AttributeSet attrs,
      Object o, String relName, String viewName) {
    X sub = augmentContext(x, attrs);

    FObject data = (FObject) (o instanceof Value ? ((Value) o).get() : o);
    if (data == null) {
      Log.e(LOG_TAG, "Could not load data object for relationship: " + relName);
      return null;
    }

    Relationship rel = data.model().getRelationship(relName);
    if (rel == null) {
      Log.e(LOG_TAG, "Failed to load relationship \"" + relName + "\"");
      return null;
    }
    DAO relatedDAO = rel.get(data);

    ViewBridge child = null;
    sub = sub.put("relationship", relatedDAO).put("dao", relatedDAO);
    XContext subcontext = new XContext(context, sub);
    if (viewName != null) {
      child = viewNameToViewBridge(viewName, subcontext, attrs);
    } else {
      child = new DAOListViewBridge(subcontext, attrs);
    }

    List<ViewBridge> list = (List<ViewBridge>) x.get("propertyViews");
    if (list != null) {
      list.add(child);
    }

    child.X(sub);
    return child;
  }

  /**
   * Adds parameters to a FOAM {@link X} context from an AttributeSet.
   *
   * Add more parameters here as needed. <code>label</code> and others.
   * @param x The {@link X} to be augmented.
   * @param attrs An {@link AttributeSet} that may contain interesting parameters.
   * @return A child {@link X} with any new parameters added.
   */
  private static X augmentContext(X x, AttributeSet attrs) {
    String label = AttributeUtils.find(attrs, "label");
    if (label != null) x = x.put("label", label);
    return x;
  }


  private static Model modelFromName(String modelName) {
    try {
      Class c = Class.forName(modelName);
      return (Model) c.getMethod("MODEL").invoke(null);
    } catch (ClassNotFoundException e) {
      Log.e(LOG_TAG, "Could not find model \"" + modelName + "\"");
      return null;
    } catch (NoSuchMethodException e) {
      Log.e(LOG_TAG, "Class provided as \"foam:model\", \"" + modelName +
          "\", is not a real Model, has no .MODEL()");
      return null;
    } catch (IllegalAccessException e) {
      Log.e(LOG_TAG, "Could not execute \"" + modelName + ".MODEL()\". Provide a FOAM-generated Model.");
      return null;
    } catch (InvocationTargetException e) {
      Log.e(LOG_TAG, "Exception inside \"" + modelName + ".MODEL()\": " + e.getCause());
      return null;
    }
  }

  private static ViewBridge viewNameToViewBridge(String viewName, Context context, AttributeSet attrs) {
    try {
      return (ViewBridge) Class.forName(viewName).getConstructor(Context.class, AttributeSet.class).newInstance(context, attrs);
    } catch (ClassNotFoundException e) {
      Log.e(LOG_TAG, "Could not find FOAM ViewBridge \"" + viewName + "\"");
      return null;
    } catch (NoSuchMethodException e) {
      Log.e(LOG_TAG, "Could not find constructor(Context, AttributeSet) on \"" + viewName + "\"");
      return null;
    } catch (IllegalAccessException e) {
      Log.e(LOG_TAG, "Could not access constructor(Context, AttributeSet) on \"" + viewName + "\"; is it public?");
      return null;
    } catch (InstantiationException e) {
      Log.e(LOG_TAG, "Failed to instantiate \"" + viewName + "\"; is it abstract?");
      return null;
    } catch (InvocationTargetException e) {
      Log.e(LOG_TAG, "Exception in constructor for \"" + viewName + "\": " + e.getCause());
      return null;
    } catch (ClassCastException e) {
      Log.e(LOG_TAG, "Created a \"" + viewName + "\", but it's not a ViewBridge. Targets of <foam> tags must descend from ViewBridge.");
      return null;
    }
  }
}
