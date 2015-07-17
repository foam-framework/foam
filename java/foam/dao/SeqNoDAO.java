package foam.dao;

import foam.core.FObject;
import foam.core.Property;
import foam.core.X;

/**
 * A ProxyDAO that injects a new ID for any item that doesn't already have one.
 *
 * TODO(braden): Support arbitrary sequence numbering. In practice it's ID 99% of the time.
 * TODO(braden): Also assumes that the ID is an int.
 */
public class SeqNoDAO extends ProxyDAO {
  private int nextID = -1;

  public SeqNoDAO(DAO delegate) {
    super(delegate);
  }

  private void findMax(X x) throws DAOInternalException, DAOException {
    MLang.MaxSink sink = (MLang.MaxSink) getDelegate().select(x, MLang.MAX(getModel().getID()));
    if (sink != null) {
      Integer max = (Integer) sink.getMax();
      nextID = max == null ? 1 : max.intValue() + 1;
    }
  }

  @Override
  public FObject put(X x, FObject o) throws DAOInternalException, DAOException {
    // Check if the object has an ID value.
    Property<Integer> ID = getModel().getID();
    int id = ID.get(o);
    if (id == 0) {
      if (nextID < 0) findMax(x);
      FObject obj = (FObject) o;
      obj = (FObject) obj.fclone();
      ID.set(obj, nextID);
      obj.freeze();
      o = obj;
      nextID++;
    }

    return getDelegate().put(x, o);
  }
}
