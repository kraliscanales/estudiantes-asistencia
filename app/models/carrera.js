import Model from "./model.js";

export default class Carrera extends Model {
  table = "carreras";
  constructor(nombre) {
    super();
    this.id = Date.now();
    this.nombre = nombre;
  }
}
