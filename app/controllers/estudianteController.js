import inquirer from "inquirer";
import chalk from "chalk";
import Estudiante from "../models/estudiante.js";
import Seccion from "../models/seccion.js";
import Helper from "../helpers/helper.js";

export default class EstudianteController {
  opcion = 0;

  opciones = [
    { name: "Menu anterior", value: 0 },
    { name: "Mostrar Estudiantes", value: 1 },
    { name: "Crear Estudiante", value: 2 },
    { name: "Editar Estudiante", value: 3 },
    { name: "Eliminar Estudiante", value: 4 },
  ];

  constructor(opcion) {
    this.opcion = opcion;
    this.estudiante = new Estudiante();
    this.seccion = new Seccion();
  }

  async validarMenu(opcion) {
    if (opcion == 0) return;
    else if (opcion == 1) await this.read();
    else if (opcion == 2) await this.create();
    else if (opcion == 3) await this.update();
    else if (opcion == 4) await this.delete();
    else console.log(chalk.bgRed.white("Opción no válida"));
  }

  async init() {
    let opcion;
    do {
      console.clear();
      opcion = await Helper.menu("Menú de Estudiantes", this.opciones);
      await this.validarMenu(opcion);
    } while (opcion != 0);
  }
}