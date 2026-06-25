import inquirer from "inquirer";
import chalk from "chalk";

import docenteController from "./app/controllers/docenteController.js";
import estudianteController from "./app/controllers/estudianteController.js";
import asistenciaController from "./app/controllers/asistenciaController.js";

import Seccion from "./app/models/seccion.js";

async function inicializarSecciones() {
  const seccion = new Seccion();
  const secciones = await seccion.load();

  if (secciones.length === 0) {
    const seccionesDefault = [
      { table: "secciones", id: 1, nombre: "Preescolar" },
      { table: "secciones", id: 2, nombre: "Primer Grado" },
      { table: "secciones", id: 3, nombre: "Segundo Grado" },
      { table: "secciones", id: 4, nombre: "Tercer Grado" },
      { table: "secciones", id: 5, nombre: "Cuarto Grado" },
      { table: "secciones", id: 6, nombre: "Quinto Grado" },
      { table: "secciones", id: 7, nombre: "Sexto Grado" },
    ];
    await seccion.saveAll(seccionesDefault);
  }
}

async function init() {
  const setup = await inquirer.prompt([
    {
      type: "select",
      name: "opcion",
      message: `¿Qué deseas hacer?`,
      choices: [
        { name: "Docentes", value: "1" },
        { name: "Estudiantes", value: "2" },
        { name: "Asistencia", value: "3" },
        { name: "Salir", value: "4" },
      ],
    },
  ]);
  console.log(chalk.bgGray.black("Opción seleccionada: " + setup.opcion));
  return setup.opcion;
}

async function MainMenu(opcion) {
  if (opcion === "1") {
    const docente = new docenteController(opcion);
    await docente.init();
  } else if (opcion === "2") {
    const estudiante = new estudianteController(opcion);
    await estudiante.init();
  } else if (opcion === "3") {
    const asistencia = new asistenciaController(opcion);
    await asistencia.init();
  } else if (opcion === "4") {
    // Salir
  } else {
    console.log(
      chalk.bgRed.white(
        "Opción no válida. Por favor, selecciona una opción válida.",
      ),
    );
  }
}

await inicializarSecciones();

let opcion;
do {
  console.clear();
  opcion = await init();
  await MainMenu(opcion);
} while (opcion !== "4");