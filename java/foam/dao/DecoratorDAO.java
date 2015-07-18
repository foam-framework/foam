package foam.dao;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.ListIterator;

import foam.core.Expression;
import foam.core.FObject;
import foam.core.X;

/**
 * {@link DAO} that combines several {@link DAODecorator}s to massage data stored in a {@link DAO}.
 *
 * Performs a {@link DAO#find(X, Object)} to retrieve the original value, if any. Clones the new
 * value before passing it to the decorators.
 *
 * Decorators are run in order when entering the DAO, and in reverse order when leaving the DAO.
 */
public class DecoratorDAO extends ProxyDAO {
  private List<DAODecorator> decorators;

  public DecoratorDAO(DAO delegate) {
    super(delegate);
    decorators = new ArrayList<>();
  }
  public DecoratorDAO(DAO delegate, List<DAODecorator> decorators) {
    super(delegate);
    this.decorators = decorators;
  }

  public void addDecorator(DAODecorator decorator) {
    decorators.add(decorator);
  }
  public void addDecorator(int index, DAODecorator decorator) {
    decorators.add(index, decorator);
  }

  private FObject decorateOut(FObject original, FObject latest) {
    ListIterator<DAODecorator> li = decorators.listIterator(decorators.size());
    while(li.hasPrevious()) {
      DAODecorator dec = li.previous();
      latest = dec.decorateOut(original, latest);
    }
    return latest;
  }

  private FObject decorateIn(FObject original, FObject latest) {
    for (DAODecorator dec : decorators) {
      latest = dec.decorateIn(original, latest);
    }
    return latest;
  }

  @Override
  public FObject find(X x, Object where) throws DAOException, DAOInternalException {
    FObject obj = getDelegate().find(x, where);
    return decorateOut(obj, obj);
  }

  @Override
  public Sink select_(X x, Sink sink, Expression<Boolean> p, Comparator c, long skip, long limit) throws DAOException, DAOInternalException {
    getDelegate().select_(x, new DecoratedSink(sink), p, c, skip, limit);
    return sink;
  }

  @Override
  public FObject put(X x, FObject obj) throws DAOException, DAOInternalException {
    FObject cloned = obj.fclone();
    FObject decorated = decorateIn(getDelegate().find(x, obj.model().getID().get(obj)), cloned);
    return getDelegate().put(x, decorated);
  }


  private class DecoratedSink implements Sink {
    private Sink sink;
    public DecoratedSink(Sink sink) {
      this.sink = sink;
    }

    @Override
    public FObject put(X x, FObject obj) throws DAOException, DAOInternalException {
      return sink.put(x, decorateOut(obj, obj));
    }
  }
}
