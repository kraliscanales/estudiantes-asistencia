import Model from "./model.js";
export default class Seccion extends Model {
  table = "secciones";
  constructor(nombre) {
    super();
    this.id = Date.now();
    this.nombre = nombre;
  }
}
