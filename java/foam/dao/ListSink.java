package foam.dao;

import java.util.LinkedList;
import java.util.List;

import foam.core.FObject;
import foam.core.X;

/**
 * A {@link Sink} that records the results into a {@link LinkedList}.
 */
public class ListSink implements Sink {
  private List<FObject> list;
  public ListSink() {
    list = new LinkedList<>();
  }
  public FObject put(X x, FObject o) {
    list.add(o);
    return o;
  }

  public List<FObject> getList() {
    return list;
  }
}
