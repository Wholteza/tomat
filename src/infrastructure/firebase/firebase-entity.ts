abstract class EntityBase {
  public id?: string;
  public exists = () => !!this.id;
}

export default EntityBase;
