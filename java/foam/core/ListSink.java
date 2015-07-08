package foam.core;

import java.util.LinkedList;
import java.util.List;

/**
 * A {@link Sink} that records the results into a {@link LinkedList}.
 */
public class ListSink implements Sink {
  private List list;
  public ListSink() {
    list = new LinkedList();
  }
  public Object put(X x, Object o) {
    list.add(o);
    return o;
  }

  public List getList() {
    return list;
  }
}
