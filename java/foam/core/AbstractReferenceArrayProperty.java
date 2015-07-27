package foam.core;

import java.util.List;

/**
 * Abstract base class for {@link Property} objects which are arrays of references to other objects.
 */
public abstract class AbstractReferenceArrayProperty<T> extends AbstractArrayProperty<T> implements ReferenceProperty<List<T>> {
}
