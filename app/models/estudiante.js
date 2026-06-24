import Model from "./model.js";
export default class Estudiante extends Model {
  table = "estudiantes";
  constructor(nombre, sexo, edad, seccion_id) {
    super();
    this.id = Date.now();
    this.nombre = nombre;
    this.sexo = sexo;
    this.edad = edad;
    this.seccion_id = seccion_id;
  }
}
