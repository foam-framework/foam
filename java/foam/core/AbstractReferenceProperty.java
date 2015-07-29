package foam.core;

/**
 * Abstract base class for reference {@link Property} values.
 */
public abstract class AbstractReferenceProperty<T> extends AbstractProperty<T> implements ReferenceProperty<T> {
  @Override
  public int compareValues(T a, T b) {
    return ComparisonHelpers.compareGeneric(this, a, b);
  }
}
