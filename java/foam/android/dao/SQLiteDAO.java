package foam.android.dao;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

import foam.core.Expression;
import foam.core.FObject;
import foam.core.Model;
import foam.core.Property;
import foam.core.X;
import foam.dao.AbstractDAO;
import foam.dao.DAOException;
import foam.dao.DAOInternalException;
import foam.dao.IterableSelectHelper;
import foam.dao.Sink;

/**
 * DAO for Android's SQLite database engine.
 *
 * Currently deletes everything on a schema migration, but also never triggers a DB version number
 * bump.
 * TODO(braden): Handle schema migrations properly.
 */
public class SQLiteDAO extends AbstractDAO {
  private static final String FOAM_DB_NAME = "FOAM";
  private static Map<Context, OpenHelper> helpers = new HashMap<>();

  private Context context;
  protected OpenHelper helper;
  protected String tableName;

  public SQLiteDAO(Model model, Context context) {
    this(model, context, model.getShortName());
  }

  public SQLiteDAO(Model model, Context context, String tableName) {
    super(model);
    // Supposedly one should only have one handle per database, not per table. Therefore
    // helpers is a static map of per-Context OpenHelpers. We fetch or create-and-store the helper
    // for our own Context (actually, getApplicationContext(), because we only need one overall.)
    Context root = context.getApplicationContext();
    if (helpers.containsKey(root)) helper = helpers.get(root);
    else {
      helper = new OpenHelper(root, FOAM_DB_NAME, null, 1);
      helpers.put(root, helper);
    }

    this.tableName = tableName;
    maybeCreate();
  }

  /**
   * Attempt to CREATE TABLE IF NOT EXIST at startup.
   */
  private void maybeCreate() {
    helper.getWritableDatabase().execSQL(SQLUtil.buildTable(getModel(), tableName));
  }

  @Override
  public Sink select_(X x, Sink sink, Expression<Boolean> p, Comparator c, long skip, long limit) throws DAOException, DAOInternalException {
    // TODO(braden): Be much, much more efficient: Handle as much filtering, sorting and limiting
    // inside the database as possible.
    // First, construct the query: SELECT * FROM MyModel;
    try {
      String query = "SELECT * FROM " + tableName + ";";
      SQLiteDatabase db = helper.getReadableDatabase();
      Cursor cursor = db.rawQuery(query, null);

      ArrayList<FObject> results = new ArrayList<>();
      if (cursor != null && cursor.moveToFirst()) {
        do {
          results.add(SQLUtil.fromSQL(getModel(), cursor));
        } while (cursor.moveToNext());

        Iterable<FObject> it = IterableSelectHelper.decorate(results, p, c, skip, limit);
        for (FObject o : it) {
          sink.put(x, o);
        }
      }

      db.close();
    } catch (SQLiteException e) {
      throw new DAOInternalException("Internal SQL error", e);
    }
    return sink;
  }

  @Override
  public void remove(X x, FObject obj) throws DAOException, DAOInternalException {
    Property idProp = getModel().getID();
    try {
      SQLiteDatabase db = helper.getWritableDatabase();
      // TODO(braden): Support other property types here.
      db.delete(tableName, idProp.getName() + " = " + idProp.get(obj), null);
      db.close();
      notify_(NOTIFY_REMOVE, x, obj);
    } catch (SQLiteException e) {
      throw new DAOInternalException("Internal SQL error", e);
    }
  }

  @Override
  public FObject put(X x, FObject obj) throws DAOException, DAOInternalException {
    ContentValues cv = SQLUtil.toSQL(obj);
    try {
      SQLiteDatabase db = helper.getWritableDatabase();
      long newID = db.insertWithOnConflict(tableName, null, cv, SQLiteDatabase.CONFLICT_REPLACE);
      FObject cloned = obj.fclone();
      getModel().getID().set(cloned, (int) newID);
      cloned.freeze();
      notify_(NOTIFY_PUT, x, cloned);
      return cloned;
    } catch(SQLiteException e) {
      throw new DAOInternalException("Internal SQL error", e);
    }
  }


  private static class OpenHelper extends SQLiteOpenHelper {
    public OpenHelper(Context context, String name, SQLiteDatabase.CursorFactory factory, int version) {
      super(context, name, factory, version);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
      // Do nothing. Individual DAOs are responsible for calling CREATE TABLE IF NOT EXIST ...
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
      // TODO(braden): Eventually, we can support migrations by serializing the models into their
      // own table alongside the data. Not sure if we ever want to support that here.
      // TODO(braden): How to drop all tables here?
    }
  }
}
