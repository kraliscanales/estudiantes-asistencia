import Model from "./model.js";
export default class Asistencia extends Model {
  table = "asistencias";
  constructor(estudiante_id, fecha, estado) {
    super();
    this.id = Date.now();
    this.estudiante_id = estudiante_id;
    this.fecha = fecha;
    this.estado = estado;
  }
}