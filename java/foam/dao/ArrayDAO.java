package foam.dao;

import java.util.Comparator;
import java.util.List;

import foam.core.Expression;
import foam.core.FObject;
import foam.core.Model;
import foam.core.X;

/**
 * DAO that wraps a Java array (or Collection) into a DAO interface.
 */
public class ArrayDAO extends AbstractDAO {
  private List list;

  public ArrayDAO(Model model, List<? extends FObject> list_) {
    super(model);
    list = list_;
  }

  @Override
  public Sink select_(X x, Sink sink, Expression<Boolean> p, Comparator c, long skip, long limit) throws DAOException, DAOInternalException {
    if (sink instanceof MLang.CountSink && p == null) {
      ((MLang.CountSink) sink).setCount(Math.max((long) list.size() - skip, limit));
      return sink;
    }

    Iterable<FObject> i = IterableSelectHelper.decorate(list, p, c, skip, limit);
    for (FObject o : i) {
      sink.put(x, o);
    }

    return sink;
  }

  @Override
  public void remove(X x, FObject obj) throws DAOException, DAOInternalException {
    list.remove(obj);
  }

  @Override
  public FObject put(X x, FObject obj) throws DAOException, DAOInternalException {
    int index = list.indexOf(obj);
    if (index >= 0) {
      list.set(index, obj);
    } else {
      list.add(obj);
    }
    return obj;
  }
}
