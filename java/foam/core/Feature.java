package foam.core;

/**
 * Underlying interface for any feature. Extended by {@link Property} and {@link Relationship}.
 */
public interface Feature<T> extends Function<Object, T> {
  String  getName();
  String  getLabel();
  T       get(Object obj);
}
