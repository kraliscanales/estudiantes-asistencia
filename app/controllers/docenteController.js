import inquirer from "inquirer";
import chalk from "chalk";

import Docente from "../models/docente.js";
import Helper from "../helpers/helper.js";

export default class DocenteController {
  opcion = 0;
  opciones = [
    { name: "Menu anterior", value: 0 },
    { name: "Mostrar Docentes", value: 1 },
    { name: "Crear Docente", value: 2 },
    { name: "Editar Docente", value: 3 },
    { name: "Eliminar Docente", value: 4 },
  ];

  constructor(opcion) {
    this.opcion = opcion;
    this.docente = new Docente();
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
    console.log(chalk.bgGreen.white("Creando docente..."));

    let payload = await inquirer.prompt([
      {
        type: "input",
        name: "nombre",
        message: "Ingrese el nombre del docente:",
        validate: (input) => {
          if (input.trim() === "") return "El nombre del docente no puede estar vacío.";
          return true;
        },
      },
      {
        type: "select",
        name: "sexo",
        message: "Seleccione el sexo del docente:",
        choices: [
          { name: "Masculino", value: "M" },
          { name: "Femenino", value: "F" },
        ],
      },
      {
        type: "input",
        name: "edad",
        message: "Ingrese la edad del docente:",
        validate: (input) => {
          if (input.trim() === "") return "La edad no puede estar vacía.";
          if (isNaN(parseInt(input))) return "Debe ingresar un número válido.";
          return true;
        },
      },
      {
        type: "input",
        name: "materia",
        message: "Ingrese la materia que imparte:",
        validate: (input) => {
          if (input.trim() === "") return "La materia no puede estar vacía.";
          return true;
        },
      },
    ]);

    const existe = await this.validateDocente(payload.nombre);
    if (existe) {
      console.log(chalk.bgRed.white("No se puede crear el docente, ya existe"));
      console.log();
      await Helper.esperar();
      return;
    }

    await this.docente.save({
      table: this.docente.getTable(),
      id: Date.now(),
      nombre: payload.nombre,
      sexo: payload.sexo,
      edad: parseInt(payload.edad),
      materia: payload.materia,
    });

    console.log();
    console.log(chalk.bgGreen.white("Docente creado exitosamente"));
    await Helper.esperar();
  }

  async read() {
    console.log(chalk.bgBlue.white("Mostrando docentes..."));
    console.log();
    const docentes = await this.docente.load();
    const rows = docentes.map((d) => ({
      ID: d.id,
      Nombre: d.nombre,
      Sexo: d.sexo,
      Edad: d.edad,
      Materia: d.materia,
    }));
    console.table(rows);
    console.log();
    await Helper.esperar();
  }

  async update() {
    console.clear();
    console.log(chalk.bgYellow.white("Editando docente..."));

    const docentes = await this.docente.load();
    if (docentes.length === 0) {
      console.log(chalk.bgRed.white("No hay docentes registrados para editar."));
      await Helper.esperar();
      return;
    }

    console.log(chalk.bgBlue.white("Docentes registrados:"));
    const rows = docentes.map((d) => ({
      ID: d.id,
      Nombre: d.nombre,
      Sexo: d.sexo,
      Edad: d.edad,
      Materia: d.materia,
    }));
    console.table(rows);

    let payload = await inquirer.prompt([
      {
        type: "input",
        name: "id",
        message: "Ingrese el ID del docente a editar:",
        validate: (input) => {
          if (input.trim() === "") return "El ID no puede estar vacío.";
          if (isNaN(parseInt(input))) return "Debe ingresar un número válido.";
          return true;
        },
      },
    ]);

    const id = parseInt(payload.id);
    const index = docentes.findIndex((d) => d.id === id);
    if (index === -1) {
      console.log(chalk.bgRed.white("No se encontró un docente con ese ID."));
      await Helper.esperar();
      return;
    }

    const docente = docentes[index];
    console.log(chalk.bgCyan.white("Deje el campo en blanco para mantener el valor actual."));

    let nuevosDatos = await inquirer.prompt([
      {
        type: "input",
        name: "nombre",
        message: `Nombre [${docente.nombre}]:`,
      },
      {
        type: "input",
        name: "sexo",
        message: `Sexo (M/F) [${docente.sexo}]:`,
      },
      {
        type: "input",
        name: "edad",
        message: `Edad [${docente.edad}]:`,
      },
      {
        type: "input",
        name: "materia",
        message: `Materia [${docente.materia}]:`,
      },
    ]);

    if (nuevosDatos.nombre.trim() !== "") docente.nombre = nuevosDatos.nombre.trim();
    if (nuevosDatos.sexo.trim() !== "") docente.sexo = nuevosDatos.sexo.trim();
    if (nuevosDatos.edad.trim() !== "") docente.edad = parseInt(nuevosDatos.edad.trim());
    if (nuevosDatos.materia.trim() !== "") docente.materia = nuevosDatos.materia.trim();

    await this.docente.saveAll(docentes);

    console.log();
    console.log(chalk.bgGreen.white("Docente actualizado exitosamente"));
    await Helper.esperar();
  }

  async delete() {
    console.clear();
    console.log(chalk.bgRed.white("Eliminando docente..."));

    const docentes = await this.docente.load();
    if (docentes.length === 0) {
      console.log(chalk.bgRed.white("No hay docentes registrados para eliminar."));
      await Helper.esperar();
      return;
    }

    console.log(chalk.bgBlue.white("Docentes registrados:"));
    const rows = docentes.map((d) => ({
      ID: d.id,
      Nombre: d.nombre,
      Sexo: d.sexo,
      Edad: d.edad,
      Materia: d.materia,
    }));
    console.table(rows);

    let payload = await inquirer.prompt([
      {
        type: "input",
        name: "id",
        message: "Ingrese el ID del docente a eliminar:",
        validate: (input) => {
          if (input.trim() === "") return "El ID no puede estar vacío.";
          if (isNaN(parseInt(input))) return "Debe ingresar un número válido.";
          return true;
        },
      },
    ]);

    const id = parseInt(payload.id);
    const index = docentes.findIndex((d) => d.id === id);
    if (index === -1) {
      console.log(chalk.bgRed.white("No se encontró un docente con ese ID."));
      await Helper.esperar();
      return;
    }

    const confirmacion = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmar",
        message: `¿Está seguro de eliminar al docente "${docentes[index].nombre}"?`,
        default: false,
      },
    ]);

    if (!confirmacion.confirmar) {
      console.log(chalk.bgCyan.white("Operación cancelada."));
      await Helper.esperar();
      return;
    }

    docentes.splice(index, 1);

    await this.docente.saveAll(docentes);

    console.log();
    console.log(chalk.bgGreen.white("Docente eliminado exitosamente"));
    await Helper.esperar();
  }

  async validateDocente(nombre) {
    const docente = await this.buscarDocente(nombre);
    return docente ? true : false;
  }

  async buscarDocente(nombre) {
    const docentes = await this.docente.load();
    return docentes.find(
      (docente) => docente.nombre.toLowerCase().trim() === nombre.toLowerCase().trim(),
    );
  }

  async init() {
    let opcion;
    do {
      console.clear();
      opcion = await Helper.menu("Menú de Docentes", this.opciones);
      await this.validarMenu(opcion);
    } while (opcion != 0);
  }
}