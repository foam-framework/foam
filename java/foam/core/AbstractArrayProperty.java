package foam.core;

import java.util.List;

/**
 * Base class for array-valued property types.
 */
public abstract class AbstractArrayProperty<T> extends AbstractProperty<List<T>> implements ArrayProperty<T> {
  @Override
  public int compareValues(List<T> o1, List<T> o2) {
    int length1 = o1 == null ? 0 : o1.size();
    int length2 = o2 == null ? 0 : o2.size();

    // An empty list is before any filled list.
    if (length1 == 0 && length2 == 0) return 0;
    if (length1 == 0) return -1;
    if (length2 == 0) return 1;

    // Lexicographic ordering: the first different element determines the order.
    // If one list is a prefix of the other, the prefix sorts earlier.
    int minLength = Math.min(length1, length2);
    for (int i = 0; i < minLength; i++) {
      int res = compareElements(o1.get(i), o2.get(i));
      if (res != 0) return res;
    }

    // Prefix or identical: compare lengths.
    return length1 - length2;
  }

  public int compareElements(Object i1, Object i2) {
    return ComparisonHelpers.compareGeneric(this, i1, i2);
  }
}
