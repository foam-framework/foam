package foam.android.app;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import foam.android.core.FOAMFragment;
import foam.android.core.XContext;
import foam.android.view.DetailViewBridge;
import foam.core.FObject;
import foam.core.PropertyChangeEvent;
import foam.core.PubSubListener;
import foam.core.SimpleValue;
import foam.core.Value;
import foam.core.ValueChangeEvent;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.DAOException;
import foam.dao.DAOInternalException;

/**
 * Activity that displays essentially an UpdateDetailView for a given item, which is expected
 * attached to the context, which should be a FOAM {@link XContext}.
 */
public class DetailFragment extends FOAMFragment {
  private static final String LOG_TAG = "DetailFragment";
  private ValueListener valueListener;
  private ObjectListener objectListener;
  private Value<FObject> value;

  @Override
  public void onCreate(Bundle bundle) {
    super.onCreate(bundle);

  }

  @Override
  public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
    Context context = container.getContext();
    X x = findX(context);
    if (x == null) return null;

    // Try to fetch the data from the context. Failing that, load from the memento.
    Object selection = x.get("selection");
    FObject data = null;
    if (selection != null) {
      if (!(selection instanceof Value)) {
        Log.e(LOG_TAG, "Expected \"X.selection\" to be a Value.");
        return null;
      }
      data = ((Value<FObject>) selection).get();
      if (data == null) selection = null;
    }

    // Deliberately not the "else" of the above "if".
    if (selection == null) {
      selection = getMemento().getSerializable("data");
      if (selection == null) {
        Log.e(LOG_TAG, "Expected either \"X.selection\" to be defined, or the memento to contain \"data\".");
        return null;
      }

      try {
        DAO dao = (DAO) x.get("dao");
        data = dao.find(x, selection);
      } catch (DAOException e) {
        Log.e(LOG_TAG, "Error retrieving " + selection + " from the DAO", e);
      } catch (DAOInternalException e) {
        Log.e(LOG_TAG, "Internal DAO error retrieving " + selection + " from the DAO", e);
      }
    }

    data = data.fclone(); // Clone to get an unfrozen, editable object.
    value = new SimpleValue<>(data);
    X(x.put("data", value));

    valueListener = new ValueListener();
    value.addListener(valueListener);
    objectListener = new ObjectListener();
    data.addPropertyChangeListener(null, objectListener);

    container.removeAllViews();

    // Inflating in code, the file is needlessly simple.
    LinearLayout layout = new LinearLayout(context);
    layout.setOrientation(LinearLayout.VERTICAL);
    layout.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT));

    DetailViewBridge bridge = new DetailViewBridge(context);
    bridge.X(X());

    Object raw = X().get("data");
    Value value = null;
    if (raw instanceof Value) {
      value = (Value) raw;
    } else if (raw instanceof FObject) {
      value = new SimpleValue<FObject>((FObject) raw);
    }
    if (value != null) bridge.setValue(value);

    layout.addView(bridge.getView());
    return layout;
  }

  /**
   * Listener for the whole {@link FObject} being replaced inside the data {@link Value}.
   */
  private class ValueListener implements PubSubListener<ValueChangeEvent<FObject>> {
    @Override
    public void eventOccurred(String[] topic, ValueChangeEvent<FObject> event) {
      FObject old = event.getOldValue();
      FObject nu = event.getNewValue();
      if (old != null) old.removePropertyChangeListener(null, objectListener);
      if (nu != null) nu.addPropertyChangeListener(null, objectListener);
    }
  }

  /**
   * Listener for properties within the {@link FObject} changing.
   *
   * Updates the DAO whenever the contents change.
   */
  private class ObjectListener implements PubSubListener {
    @Override
    public void eventOccurred(String[] topic, Object rawEvent) {
      // TODO(braden): This might be too spammy. Add isMerged support to Android and use it here.
      if (!(rawEvent instanceof PropertyChangeEvent)) return;
      PropertyChangeEvent event = (PropertyChangeEvent) rawEvent;
      DAO dao = (DAO) X().get("dao");
      if (dao != null) {
        try {
          FObject nu = dao.put(X(), event.getTarget());
          value.set(nu.fclone());
        } catch (DAOInternalException e) {
          Log.w(LOG_TAG, "Internal DAO error while trying to save updates: " + e.getMessage());
        } catch (DAOException e) {
          Log.w(LOG_TAG, "DAO error while trying to save updates: " + e.getMessage());
        }
      }
    }
  }
}
