import Model from "./model.js";
export default class Docente extends Model {
  table = "docentes";
  constructor(nombre, sexo, edad, materia) {
    super();
    this.id = Date.now();
    this.nombre = nombre;
    this.sexo = sexo;
    this.edad = edad;
    this.materia = materia;
  }
}