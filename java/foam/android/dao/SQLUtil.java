package foam.android.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.util.Log;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.StreamCorruptedException;

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
      if (p.getType() == Property.TYPE_STRING) p.set(obj, cursor.getString(index));
      else if (p.getType() == Property.TYPE_BOOLEAN) p.set(obj, cursor.getInt(index) == 1);
      else if (p.getType() == Property.TYPE_INTEGER) p.set(obj, cursor.getInt(index));
      else if (p.getType() == Property.TYPE_DOUBLE) p.set(obj, cursor.getDouble(index));
      else if (p.getType() == Property.TYPE_FLOAT) p.set(obj, cursor.getFloat(index));
      else if (p.isArray()) p.set(obj, deserialize(cursor.getBlob(index)));
      else Log.w(LOG_TAG, "Unknown column type for " + p.getName() + " property");
      index++;
    }

    return obj;
  }

  public static ContentValues toSQL(FObject obj) {
    ContentValues v = new ContentValues();
    for (Property p : obj.model().getProperties()) {
      if (p.getType() == Property.TYPE_STRING) v.put(p.getName(), (String) p.get(obj));
      else if (p.getType() == Property.TYPE_BOOLEAN) v.put(p.getName(), ((Boolean) p.get(obj)).booleanValue() ? 1 : 0);
      else if (p.getType() == Property.TYPE_INTEGER) v.put(p.getName(), (Integer) p.get(obj));
      else if (p.getType() == Property.TYPE_FLOAT) v.put(p.getName(), (Float) p.get(obj));
      else if (p.getType() == Property.TYPE_DOUBLE) v.put(p.getName(), (Double) p.get(obj));
      else if (p.isArray()) v.put(p.getName(), serialize(p.get(obj)));
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
    if (prop.getType() == Property.TYPE_STRING) return "TEXT";
    if (prop.getType() == Property.TYPE_INTEGER) return "INTEGER";
    if (prop.getType() == Property.TYPE_BOOLEAN) return "INTEGER";
    if (prop.getType() == Property.TYPE_DOUBLE) return "REAL";
    if (prop.getType() == Property.TYPE_FLOAT) return "REAL";
    if (prop.isArray()) return "BLOB";
    Log.w(LOG_TAG, "No known SQL type for " + prop.getName() + " property");
    return "TEXT";
  }

  private static byte[] serialize(Object o) {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    try {
      ObjectOutputStream oos = new ObjectOutputStream(out);
      oos.writeObject(o);
      oos.flush();
    } catch (IOException e) {
      Log.e(LOG_TAG, "Error serializing object: " + o);
    }
    return out.toByteArray();
  }

  private static Object deserialize(byte[] arr) {
    ByteArrayInputStream in = new ByteArrayInputStream(arr);
    try {
      ObjectInputStream ois = new ObjectInputStream(in);
      return ois.readObject();
    } catch (StreamCorruptedException e) {
      Log.e(LOG_TAG, "Corrupted data for array property");
    } catch (IOException e) {
      Log.e(LOG_TAG, "Error reading array data");
    } catch (ClassNotFoundException e) {
      Log.e(LOG_TAG, "Unknown class while reading array data: ", e);
    }
    return null;
  }

}
