package foam.core;

import java.util.List;

/**
 * Abstract base class for Enum Properties.
 */
public abstract class AbstractEnumProperty<T> extends AbstractProperty<T> implements EnumProperty<T> {
  protected List<LabeledItem<T>> choices_ = null;
  protected abstract void initChoices_();

  @Override
  public List<LabeledItem<T>> getChoices() {
    if (choices_ == null) initChoices_();
    return choices_;
  }

  @Override
  public int compareValues(T o1, T o2) {
    return ComparisonHelpers.compareGeneric(this, o1, o2);
  }

  @Override
  public int getType() {
    return Property.TYPE_ENUM;
  }
}
