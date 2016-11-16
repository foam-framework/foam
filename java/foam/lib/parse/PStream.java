package foam.lib.parse;

public interface PStream {
  public char head();
  public boolean valid();
  public PStream tail();
  public Object value();
  public PStream setValue(Object value);
  public String substring(PStream end);
}
