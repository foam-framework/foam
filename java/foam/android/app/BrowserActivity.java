package foam.android.app;

import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.os.Bundle;
import android.support.annotation.IdRes;
import android.view.Menu;
import android.view.MenuItem;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import java.io.Serializable;

import foam.android.core.FOAMActionBarActivity;
import foam.core.FObject;
import foam.core.PubSubListener;
import foam.core.SimpleValue;
import foam.core.ValueChangeEvent;
import foam.dao.DAO;
import foam.dao.DAOException;
import foam.dao.DAOInternalException;
import foam.tutorials.todo.R;


public class BrowserActivity extends FOAMActionBarActivity implements PubSubListener<ValueChangeEvent<FObject>> {
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

    if (savedInstanceState != null) {
      Object id = savedInstanceState.getSerializable("selection");
      if (id != null) {
        try {
          FObject obj = dao.find(X(), id);
          selection.set(obj);
        } catch (DAOException e) {
        } catch (DAOInternalException e) {
        }
      }
    }
    selection.addListener(this);

    frame = new FrameLayout(this);
    frame.setId(frameId);
    setContentView(frame, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT));

    renderFragmentForSelection(null, selection.get());
  }

  @Override
  public void onSaveInstanceState(Bundle bundle) {
    FObject o = selection.get();
    if (o != null) {
      bundle.putSerializable("selection", (Serializable) o.model().getID().get(o));
    }
  }

  @Override
  public void eventOccurred(String[] topic, ValueChangeEvent<FObject> event) {
    FObject nu = event.getNewValue();
    renderFragmentForSelection(event.getOldValue(), nu);
  }

  /**
   * Handles updating the current fragment based on the selection.
   *
   * When the value goes null->foo, we replace and push.
   * When it goes from foo->bar, we replace without pushing.
   * When it goes from foo->null, we either pop or replace, depending on whether the value already exists.
   * When it goes from null->null, we dump the stack and add the list view.
   *
   * TODO(braden): Ultimately this should be replaced with a memento-style system of navigation.
   * @param old The previous selection value.
   * @param nu The new selection value.
   */
  private void renderFragmentForSelection(FObject old, FObject nu) {
    FragmentManager manager = getFragmentManager();
    FragmentTransaction trans = manager.beginTransaction();
    if (nu == null) { // Render the list.
      ListFragment list = new ListFragment();
      trans.replace(frameId, list);
      trans.setTransition(FragmentTransaction.TRANSIT_FRAGMENT_CLOSE);
      trans.commit();
    } else { // Render the details
      DetailFragment details = new DetailFragment();
      trans.replace(frameId, details);
      trans.setTransition(FragmentTransaction.TRANSIT_FRAGMENT_OPEN);
      trans.commit();
    }
    getSupportActionBar().setDisplayHomeAsUpEnabled(nu != null);
  }

  @Override
  public void onBackPressed() {
    FragmentManager manager = getFragmentManager();
    if (selection.get() != null) {
      selection.set(null);
    } else {
      super.onBackPressed();
    }
  }

  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
    // Inflate the menu; this adds items to the action bar if it is present.
    getMenuInflater().inflate(R.menu.menu_main, menu);
    return true;
  }
  @Override
  public boolean onOptionsItemSelected(MenuItem item) {
    // Handle action bar item clicks here. The action bar will
    // automatically handle clicks on the Home/Up button, so long
    // as you specify a parent activity in AndroidManifest.xml.
    int id = item.getItemId();

    //noinspection SimplifiableIfStatement
    if (id == R.id.action_settings) {
      return true;
    }

    return super.onOptionsItemSelected(item);
  }

  @Override
  public boolean onSupportNavigateUp() {
    return onNavigateUp();
  }
  @Override
  public boolean onNavigateUp() {
    selection.set(null);
    return true;
  }
}
