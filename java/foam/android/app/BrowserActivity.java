package foam.android.app;

import android.os.Bundle;
import android.widget.FrameLayout;
import androidx.annotation.IdRes;

import java.io.Serializable;

import foam.core.FObject;
import foam.core.PubSubListener;
import foam.core.SimpleValue;
import foam.core.ValueChangeEvent;
import foam.dao.DAO;


public abstract class BrowserActivity extends StackActivity implements PubSubListener<ValueChangeEvent<FObject>> {
  /**
   * Subclasses are expected to set {@link #dao} properly.
   */
  protected DAO dao;
  private SimpleValue<FObject> selection;
  private FrameLayout frame;
  @IdRes
  private final int frameId = 225;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    selection = new SimpleValue<>();
    X(X().put("selection", selection).put("dao", dao));
    selection.addListener(this);
  }

  @Override
  protected Bundle defaultMemento() {
    Bundle current = new Bundle();
    current.putString("fragment_", "foam.android.app.ListFragment");
    addExtraListFragmentParameters(current);
    return current;
  }

  /**
   * Children of BrowserActivity should implement this to configure the {@link ListFragment} as
   * desired. It supports "list_layout" (R.layout.*) and "button_id" (R.id.*). Both are required
   * for correct functioning of the BrowserActivity.
   *
   * @param memento A memento. Should be augmented with the values above.
   */
  protected abstract void addExtraListFragmentParameters(Bundle memento);

  @Override
  public void eventOccurred(String[] topic, ValueChangeEvent<FObject> event) {
    FObject nu = event.getNewValue();
    if (nu == null) {
      clearMementoStack();
      Bundle newMemento = new Bundle();
      newMemento.putString("fragment_", "foam.android.app.ListFragment");
      pushMemento(newMemento);
    } else {
      Bundle newMemento = new Bundle();
      newMemento.putSerializable("data", (Serializable) nu.model().getID().get(nu));
      newMemento.putString("fragment_", "foam.android.app.DetailFragment");
      pushMemento(newMemento);
    }
  }
}
