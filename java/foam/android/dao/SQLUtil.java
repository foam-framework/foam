package foam.android.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.util.Log;

import foam.core.AbstractBooleanProperty;
import foam.core.AbstractDoubleProperty;
import foam.core.AbstractFloatProperty;
import foam.core.AbstractIntProperty;
import foam.core.AbstractStringProperty;
import foam.core.FObject;
import foam.core.Model;
import foam.core.Property;

/**
 * Adapts FOAM models to Android's SQL API.
 */
public class SQLUtil {
  private static final String LOG_TAG = "SQLUtil";

  public static FObject fromSQL(Model model, Cursor cursor) {
    FObject obj = model.newInstance();
    Property[] props = model.getProperties();
    int index = 0; // Separate from the loop index because of transient properties.
    for (Property p : model.getProperties()) {
      if (p.isTransient()) continue;
      if (p instanceof AbstractStringProperty) p.set(obj, cursor.getString(index));
      else if (p instanceof AbstractBooleanProperty) p.set(obj, cursor.getInt(index) == 1);
      else if (p instanceof AbstractIntProperty) p.set(obj, cursor.getInt(index));
      else if (p instanceof AbstractDoubleProperty) p.set(obj, cursor.getDouble(index));
      else if (p instanceof AbstractFloatProperty) p.set(obj, cursor.getFloat(index));
      else Log.w(LOG_TAG, "Unknown column type for " + p.getName() + " property");
      index++;
    }

    return obj;
  }

  public static ContentValues toSQL(FObject obj) {
    ContentValues v = new ContentValues();
    for (Property p : obj.model().getProperties()) {
      if (p instanceof AbstractStringProperty) v.put(p.getName(), (String) p.get(obj));
      else if (p instanceof AbstractBooleanProperty) v.put(p.getName(), ((Boolean) p.get(obj)).booleanValue() ? 1 : 0);
      else if (p instanceof AbstractIntProperty) v.put(p.getName(), (Integer) p.get(obj));
      else if (p instanceof AbstractFloatProperty) v.put(p.getName(), (Float) p.get(obj));
      else if (p instanceof AbstractDoubleProperty) v.put(p.getName(), (Double) p.get(obj));
      else Log.w(LOG_TAG, "Unknown column type for " + p.getName() + " property");
    }

    return v;
  }


  public static String buildTable(Model model) {
    return buildTable(model, model.getShortName());
  }

  public static String buildTable(Model model, String name) {
    StringBuilder sb = new StringBuilder();
    sb.append("CREATE TABLE IF NOT EXISTS ");
    sb.append(name);
    sb.append(" ( ");

    Property[] props = model.getProperties();
    Property idProp = model.getID();
    for (int i = 0; i < props.length; i++) {
      Property p = props[i];
      if (p.isTransient()) continue;
      if (i > 0) sb.append(", ");
      sb.append(p.getName());
      sb.append(" ");
      sb.append(propToSQLType(p));
      if (p == idProp) {
        sb.append(" PRIMARY KEY");
      }
    }

    sb.append(");");
    String sql = sb.toString();
    Log.i("SQLUtil", sql);
    return sql;
  }

  private static String propToSQLType(Property prop) {
    if (prop instanceof AbstractStringProperty) return "TEXT";
    if (prop instanceof AbstractIntProperty) return "INTEGER";
    if (prop instanceof AbstractBooleanProperty) return "INTEGER";
    if (prop instanceof AbstractDoubleProperty) return "REAL";
    if (prop instanceof AbstractFloatProperty) return "REAL";
    Log.w(LOG_TAG, "No known SQL type for " + prop.getName() + " property");
    return "TEXT";
  }
}
