package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;
import android.view.ViewParent;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import foam.core.FObject;
import foam.core.HasX;
import foam.core.Property;
import foam.core.SimpleValue;
import foam.core.Value;
import foam.core.X;

/**
 * Should be installed in onCreate of all FOAM-friendly Activities.
 *
 * Knows how to turn FOAM tags into the appropriate View.
 */
public class LayoutFactory {
  private static final String LOG_TAG = "FOAMLayoutFactory";

  public static View tryToCreateFoamView(View parent_, String name, Context context, AttributeSet attrs) {
    if (!name.equals("foam.android.view.FoamTagView")) return null;

    ViewParent parent = (ViewParent) parent_;
    while (parent != null && !(parent instanceof HasX)) {
      parent = parent.getParent();
    }
    X x;
    if (parent == null) {
      if (context instanceof HasX) {
        x = ((HasX) context).X();
      } else {
        Log.w(LOG_TAG, "Failed to find a contextualized parent while inflating a <foam> tag - did you forget to extend FOAMActivity?");
        return null;
      }
    } else {
      x = ((HasX) parent).X();
    }

    // If we get down here, then we've got a context to work with.

    // There are a few cases for what to do, depending on what sort of <foam> tag we got.
    // If foam:view is set, we use that class exactly. Otherwise, use the Property's default view.
    // If foam:prop is set, we wire up X.data.prop$ and use that.
    // NB: One of foam:view or foam:prop should be set, or we don't know which property to use.
    // foam:data can be set to specify the key in X that should be used. Defaults to "data".

    // This is an ugly way of finding the properties, but the namespace support in AttributeSet is
    // strange. It expects the schema URL, which we can't really provide.
    int foamViewIndex = -1;
    int foamPropIndex = -1;
    int foamDataIndex = -1;
    for (int i = 0; i < attrs.getAttributeCount(); i++) {
      String attrName = attrs.getAttributeName(i);
      if (attrName.equalsIgnoreCase("prop")) foamPropIndex = i;
      if (attrName.equalsIgnoreCase("view")) foamViewIndex = i;
      if (attrName.equalsIgnoreCase("data")) foamDataIndex = i;
    }

    ViewBridge child = null;
    if (foamViewIndex >= 0) {
      String foamView = attrs.getAttributeValue(foamViewIndex);
      try {
        child = (ViewBridge) Class.forName(foamView)
            .getConstructor(Context.class, AttributeSet.class).newInstance(context, attrs);
      } catch (NoSuchMethodException e) {
        Log.w(LOG_TAG, "Views used in foam:view values must have a (Context, AttributeSet) constructor");
        return null;
      } catch (InvocationTargetException e) {
        Log.w(LOG_TAG, "Exception in the constructor of the foam:view target class: " + e.getCause());
        return null;
      } catch (ClassNotFoundException e) {
        Log.w(LOG_TAG, "Could not find FOAM View class: " + foamView);
        return null;
      } catch (InstantiationException e) {
        Log.w(LOG_TAG, "Failed to instantiate FOAM View class: " + foamView);
        return null;
      } catch (IllegalAccessException e) {
        Log.w(LOG_TAG, "Could not access FOAM View class: " + foamView);
        return null;
      }
    }

    if (foamPropIndex >= 0) {
      String foamProp = attrs.getAttributeValue(foamPropIndex);
      String foamKey = foamDataIndex >= 0 ? attrs.getAttributeValue(foamDataIndex) : "data";
      FObject data = (FObject) x.get(foamKey);
      if (data == null) {
        Log.w(LOG_TAG, "Could not find key \"" + foamKey + "\" in X.");
        return null;
      }

      Property prop = data.model().getProperty(foamProp);
      if (prop == null) {
        Log.w(LOG_TAG, "Failed to find property " + foamProp + " on data object.");
        return null;
      }
      if (child == null) {
        child = prop.createView(context, attrs);
      }

      Value v = prop.createValue(data);
      child.setValue(v);
      child.X(x.put("data", v).put("prop", prop));


      List<ViewBridge> list = (List<ViewBridge>) x.get("propertyViews");
      if (list != null) {
        list.add(child);
      }

      return child.getView();
    }

    if (child != null) {
      String foamKey = foamDataIndex >= 0 ? attrs.getAttributeValue(foamDataIndex) : "data";
      Object data = x.get(foamKey);
      if (data == null) {
        return null;
      }

      Value v = new SimpleValue(data);
      child.setValue(v);
      child.X(x.put("data", v));
      return child.getView();
    }

    return null;
  }
}
