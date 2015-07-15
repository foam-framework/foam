package foam.core;

import java.util.Comparator;

import foam.dao.Index;

/**
 * Compares two values of a particular {@link Property}.
 *
 * Intended to be used by {@link Index}es and similar things, that have the values of several
 * instances of the same property they want to compare.
 */
public class PropertyComparator<T> implements Comparator<T> {
  private Property<T> prop;
  public PropertyComparator(Property<T> prop) {
    this.prop = prop;
  }

  public int compare(T t1, T t2) {
    return prop.compareValues(t1, t2);
  }
}
