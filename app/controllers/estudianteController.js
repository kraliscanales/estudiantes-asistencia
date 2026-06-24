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
    async create() {
    console.clear();
    console.log(chalk.bgGreen.white("Creando estudiante..."));

    const secciones = await this.seccion.load();
    if (secciones.length === 0) {
      console.log(
        chalk.bgRed.white("No hay secciones registradas. Contacte al administrador."),
      );
      await Helper.esperar();
      return;
    }

    let payload = await inquirer.prompt([
      {
        type: "input",
        name: "nombre",
        message: "Ingrese el nombre del estudiante:",
        validate: (input) => {
          if (input.trim() === "") return "El nombre del estudiante no puede estar vacío.";
          return true;
        },
      },
      {
        type: "select",
        name: "sexo",
        message: "Seleccione el sexo del estudiante:",
        choices: [
          { name: "Masculino", value: "M" },
          { name: "Femenino", value: "F" },
        ],
      },
      {
        type: "input",
        name: "edad",
        message: "Ingrese la edad del estudiante:",
        validate: (input) => {
          if (input.trim() === "") return "La edad no puede estar vacía.";
          if (isNaN(parseInt(input))) return "Debe ingresar un número válido.";
          return true;
        },
      },
      {
        type: "select",
        name: "seccion",
        message: "Seleccione la sección del estudiante:",
        choices: secciones.map((s) => ({
          name: s.nombre,
          value: s,
        })),
      },
    ]);

    const existe = await this.validateEstudiante(payload.nombre, payload.seccion.id);
    if (existe) {
      console.log(
        chalk.bgRed.white("No se puede crear el estudiante, ya existe en esa sección"),
      );
      console.log();
      await Helper.esperar();
      return;
    }

    await this.estudiante.save({
      table: this.estudiante.getTable(),
      id: Date.now(),
      nombre: payload.nombre,
      sexo: payload.sexo,
      edad: parseInt(payload.edad),
      seccion_id: payload.seccion.id,
    });

    console.log();
    console.log(chalk.bgGreen.white("Estudiante creado exitosamente"));
    await Helper.esperar();
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