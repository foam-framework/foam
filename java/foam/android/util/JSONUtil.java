package foam.android.util;

import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;
import java.util.List;

import foam.core.FObject;
import foam.core.Model;
import foam.core.Property;
import foam.core.X;

/**
 * Utility class for marshalling modeled objects into and out of {@link JSONObject}s.
 */
public class JSONUtil {
  private static final String LOG_TAG = "JSONUtil";

  public static JSONObject toJSON(X x, FObject o) throws JSONException {
    Model model = o.model();
    JSONObject json = new JSONObject();
    json.put("model_", model.getName());

    for (Property p : model.getProperties()) {
      propertyToJSON(x, o, p, json);
    }
    return json;
  }

  private static void propertyToJSON(X x, FObject o, Property p, JSONObject json) throws JSONException {
    int type = p.getType();
    if (p.isArray()) {
      JSONArray arr = new JSONArray();
      json.put(p.getName(), arr);
      type = p.getElementType();
      for (Object obj : (List) p.get(o)) {
        if (type == Property.TYPE_BOOLEAN) arr.put((boolean) obj);
        else if (type == Property.TYPE_INTEGER) arr.put((int) obj);
        else if (type == Property.TYPE_STRING) arr.put(obj);
        else if (type == Property.TYPE_FLOAT) arr.put(obj);
        else if (type == Property.TYPE_DOUBLE) arr.put(obj);
        else if (type == Property.TYPE_OBJECT) {
          arr.put(obj instanceof FObject ? toJSON(x, (FObject) obj) : obj);
        }
      }
    } else {
      if (type == Property.TYPE_BOOLEAN) json.put(p.getName(), (boolean) p.get(o));
      else if (type == Property.TYPE_INTEGER) json.put(p.getName(), (int) p.get(o));
      else if (type == Property.TYPE_STRING) json.put(p.getName(), p.get(o));
      else if (type == Property.TYPE_FLOAT) json.put(p.getName(), (float) p.get(o));
      else if (type == Property.TYPE_DOUBLE) json.put(p.getName(), (double) p.get(o));
      else if (type == Property.TYPE_OBJECT) {
        json.put(p.getName(), p.get(o) instanceof FObject ? toJSON(x, (FObject) p.get(o)) : p.get(o));
      }
    }
  }


  public static FObject fromJSON(X x, JSONObject json) throws JSONException {
    String modelName = json.optString("model_", null);
    if (modelName == null) {
      return null;
    }

    FObject o;
    try {
      o = (FObject) x.newInstance(modelName);
    } catch (ClassNotFoundException e) {
      Log.e(LOG_TAG, "Unrecognized model_: \"" + modelName + "\"", e);
      return null;
    } catch (IllegalAccessException e) {
      Log.e(LOG_TAG, "Could not find accessible constructor for \"" + modelName + "\"", e);
      return null;
    } catch (InstantiationException e) {
      Log.e(LOG_TAG, "Exception in constructor for \"" + modelName + "\"", e.getCause());
      return null;
    } catch (ClassCastException e) {
      Log.e(LOG_TAG, "JSON Object is not descended from FObject - can't happen?", e);
      return null;
    }

    Iterator<String> it = json.keys();
    while (it.hasNext()) {
      String key = it.next();
      if (key.equals("model_")) continue;
      o.model().getProperty(key).set(o, json.get(key));
    }

    return o;
  }
}
