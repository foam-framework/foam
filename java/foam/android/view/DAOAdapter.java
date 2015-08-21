package foam.android.view;

import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import foam.dao.DAO;
import foam.dao.DAOException;
import foam.dao.DAOInternalException;
import foam.dao.FindSink;
import foam.core.HasX;
import foam.dao.MLang;
import foam.core.Value;
import foam.core.X;

/**
 * {@link RecyclerView.Adapter} for use with {@link RecyclerView}s of a {@link DAO}.
 */
public class DAOAdapter extends RecyclerView.Adapter<DAOAdapter.DAOViewHolder> implements HasX {
  private DetailViewFactory viewFactory;
  private DAO dao;
  private X x;
  public X X() {
    return x;
  }
  public void X(X x) {
    this.x = x;
  }

  public DAOAdapter(X x, DAO dao, DetailViewFactory viewFactory) {
    X(x.put("model", dao.getModel()));
    this.dao = dao;
    this.viewFactory = viewFactory;
  }

  @Override
  public int getItemCount() {
    try {
      MLang.CountSink sink = MLang.COUNT();
      dao.select(X(), sink);
      return (int) sink.getCount();
    } catch(DAOInternalException e) {
      Log.e("DAOAdapter", "DAOInternalException while trying to fetch COUNT");
    } catch(DAOException e) {
      Log.e("DAOAdapter", "DAOException while trying to fetch COUNT");
    }
    return 0;
  }

  @Override
  public DAOViewHolder onCreateViewHolder(ViewGroup parent, int position) {
    ViewBridge b = viewFactory.create(parent);
    b.X(X());
    return new DAOViewHolder(b);
  }

  @Override
  public void onBindViewHolder(DAOViewHolder holder, int position) {
    FindSink sink = new FindSink();
    try {
      dao.limit(1).skip(position).select(X(), sink);
    } catch(DAOException e) {
      Log.e("DAOAdapter", "DAOException while trying to bind a view.");
      return;
    } catch(DAOInternalException e) {
      Log.e("DAOAdapter", "DAOInternalException while trying to bind a view.");
      return;
    }
    holder.viewBridge.getValue().set(sink.getValue().fclone());
  }

  class DAOViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {
    public final ViewBridge viewBridge;
    public DAOViewHolder(ViewBridge itemView) {
      super(itemView.getView());
      viewBridge = itemView;
      // If selection is defined, then we should bind to click events.
      if (viewBridge.X().get("selection") != null)
        itemView.getView().setOnClickListener(this);
    }

    @Override
    public void onClick(View view) {
      Value selection = viewBridge.X().getValue("selection");
      if (selection != null) selection.set(viewBridge.getValue().get());
    }
  }
}
