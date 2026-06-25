import inquirer from "inquirer";
import chalk from "chalk";

import Asistencia from "../models/asistencia.js";
import Estudiante from "../models/estudiante.js";
import Seccion from "../models/seccion.js";
import Helper from "../helpers/helper.js";

export default class AsistenciaController {
  opcion = 0;
  opciones = [
    { name: "Menu anterior", value: 0 },
    { name: "Registrar asistencia", value: 1 },
    { name: "Ver asistencia por sección", value: 2 },
    { name: "Ver asistencia por estudiante", value: 3 },
    { name: "Ver asistencia por fecha", value: 4 },
    { name: "Editar asistencia", value: 5 },
    { name: "Eliminar asistencia", value: 6 },
  ];

  constructor(opcion) {
    this.opcion = opcion;
    this.asistencia = new Asistencia();
    this.estudiante = new Estudiante();
    this.seccion = new Seccion();
  }

  async validarMenu(opcion) {
    if (opcion == 0) return;
    else if (opcion == 1) await this.registrarAsistencia();
    else if (opcion == 2) await this.verPorSeccion();
    else if (opcion == 3) await this.verPorEstudiante();
    else if (opcion == 4) await this.verPorFecha();
    else if (opcion == 5) await this.editarAsistencia();
    else if (opcion == 6) await this.eliminarAsistencia();
    else console.log(chalk.bgRed.white("Opción no válida"));
  }

  async seleccionarSeccion() {
    const secciones = await this.seccion.load();
    if (secciones.length === 0) {
      console.log(chalk.bgRed.white("No hay secciones registradas."));
      await Helper.esperar();
      return null;
    }

    const opcionesSecciones = secciones.map((s) => ({
      name: s.nombre,
      value: s,
    }));

    const setup = await inquirer.prompt([
      {
        type: "select",
        name: "seccion",
        message: "Seleccione la sección:",
        choices: opcionesSecciones,
      },
    ]);

    return setup.seccion;
  }

  async seleccionarEstudiante(seccion_id) {
    const estudiantes = await this.estudiante.load();
    const estudiantesSeccion = estudiantes.filter(
      (e) => e.seccion_id === seccion_id,
    );

    if (estudiantesSeccion.length === 0) {
      console.log(chalk.bgRed.white("No hay estudiantes en esta sección."));
      await Helper.esperar();
      return null;
    }

    const opcionesEstudiantes = estudiantesSeccion.map((e) => ({
      name: `${e.nombre} (ID: ${e.id})`,
      value: e,
    }));

    const setup = await inquirer.prompt([
      {
        type: "select",
        name: "estudiante",
        message: "Seleccione el estudiante:",
        choices: opcionesEstudiantes,
      },
    ]);

    return setup.estudiante;
  }

  async obtenerNombreEstudiante(estudiante_id) {
    const estudiantes = await this.estudiante.load();
    const est = estudiantes.find((e) => e.id === estudiante_id);
    return est ? est.nombre : `ID: ${estudiante_id}`;
  }

  async obtenerNombreSeccion(seccion_id) {
    const secciones = await this.seccion.load();
    const sec = secciones.find((s) => s.id === seccion_id);
    return sec ? sec.nombre : `ID: ${seccion_id}`;
  }

  async registrarAsistencia() {
    console.clear();
    console.log(chalk.bgGreen.white("Registrar Asistencia"));

    console.log(chalk.bgCyan.white("\nPaso 1: Seleccione la sección"));
    const seccion = await this.seleccionarSeccion();
    if (!seccion) return;

    console.log(chalk.bgCyan.white(`\nPaso 2: Seleccione el estudiante de "${seccion.nombre}"`));
    const estudiante = await this.seleccionarEstudiante(seccion.id);
    if (!estudiante) return;

    console.log(chalk.bgCyan.white(`\nEstudiante: ${estudiante.nombre}`));
    const setup = await inquirer.prompt([
      {
        type: "select",
        name: "estado",
        message: "Seleccione el estado de asistencia:",
        choices: [
          { name: "Presente", value: "Presente" },
          { name: "Ausente", value: "Ausente" },
        ],
      },
    ]);

    const fecha = new Date().toISOString().split("T")[0];

    await this.asistencia.save({
      table: this.asistencia.getTable(),
      id: Date.now(),
      estudiante_id: estudiante.id,
      fecha: fecha,
      estado: setup.estado,
    });

    console.log();
    console.log(
      chalk.bgGreen.white(
        `Asistencia registrada: ${estudiante.nombre} - ${fecha} - ${setup.estado}`,
      ),
    );
    await Helper.esperar();
  }

  async verPorSeccion() {
    console.clear();
    console.log(chalk.bgBlue.white("Ver Asistencia por Sección"));

    const seccion = await this.seleccionarSeccion();
    if (!seccion) return;

    const estudiantes = await this.estudiante.load();
    const estudiantesSeccion = estudiantes.filter(
      (e) => e.seccion_id === seccion.id,
    );

    if (estudiantesSeccion.length === 0) {
      console.log(chalk.bgRed.white("No hay estudiantes en esta sección."));
      await Helper.esperar();
      return;
    }

    const idsEstudiantes = estudiantesSeccion.map((e) => e.id);
    const asistencias = await this.asistencia.load();
    const asistenciasSeccion = asistencias.filter((a) =>
      idsEstudiantes.includes(a.estudiante_id),
    );

    console.log();
    console.log(
      chalk.bgBlue.white(`Asistencia - Sección: ${seccion.nombre}`),
    );
    console.log();

    if (asistenciasSeccion.length === 0) {
      console.log("No hay registros de asistencia para esta sección.");
    } else {
      const rows = [];
      for (const a of asistenciasSeccion) {
        const nombre = await this.obtenerNombreEstudiante(a.estudiante_id);
        rows.push({
          ID: a.id,
          Estudiante: nombre,
          Fecha: a.fecha,
          Estado: a.estado,
        });
      }
      console.table(rows);
    }

    console.log();
    await Helper.esperar();
  }

  async verPorEstudiante() {
    console.clear();
    console.log(chalk.bgBlue.white("Ver Asistencia por Estudiante"));

    console.log(chalk.bgCyan.white("\nPaso 1: Seleccione la sección"));
    const seccion = await this.seleccionarSeccion();
    if (!seccion) return;

    console.log(chalk.bgCyan.white(`\nPaso 2: Seleccione el estudiante de "${seccion.nombre}"`));
    const estudiante = await this.seleccionarEstudiante(seccion.id);
    if (!estudiante) return;

    const asistencias = await this.asistencia.load();
    const asistenciasEstudiante = asistencias.filter(
      (a) => a.estudiante_id === estudiante.id,
    );

    console.log();
    console.log(
      chalk.bgBlue.white(`Asistencia - Estudiante: ${estudiante.nombre}`),
    );
    console.log();

    if (asistenciasEstudiante.length === 0) {
      console.log("No hay registros de asistencia para este estudiante.");
    } else {
      const rows = asistenciasEstudiante.map((a) => ({
        ID: a.id,
        Fecha: a.fecha,
        Estado: a.estado,
      }));
      console.table(rows);
    }

    console.log();
    await Helper.esperar();
  }

  async verPorFecha() {
    console.clear();
    console.log(chalk.bgBlue.white("Ver Asistencia por Fecha"));

    const setup = await inquirer.prompt([
      {
        type: "input",
        name: "fecha",
        message: "Ingrese la fecha (YYYY-MM-DD):",
        validate: (input) => {
          if (input.trim() === "") return "La fecha no puede estar vacía.";
          return true;
        },
      },
    ]);

    const asistencias = await this.asistencia.load();
    const asistenciasFecha = asistencias.filter(
      (a) => a.fecha === setup.fecha.trim(),
    );

    console.log();
    console.log(
      chalk.bgBlue.white(`Asistencia - Fecha: ${setup.fecha}`),
    );
    console.log();

    if (asistenciasFecha.length === 0) {
      console.log("No hay registros de asistencia para esta fecha.");
    } else {
      const rows = [];
      for (const a of asistenciasFecha) {
        const nombre = await this.obtenerNombreEstudiante(a.estudiante_id);
        rows.push({
          ID: a.id,
          Estudiante: nombre,
          Estado: a.estado,
        });
      }
      console.table(rows);
    }

    console.log();
    await Helper.esperar();
  }

  async editarAsistencia() {
    console.clear();
    console.log(chalk.bgYellow.white("Editar Asistencia"));

    const asistencias = await this.asistencia.load();
    if (asistencias.length === 0) {
      console.log(chalk.bgRed.white("No hay asistencias registradas para editar."));
      await Helper.esperar();
      return;
    }

    console.log(chalk.bgBlue.white("Asistencias registradas:"));
    const rows = [];
    for (const a of asistencias) {
      const nombre = await this.obtenerNombreEstudiante(a.estudiante_id);
      rows.push({
        ID: a.id,
        Estudiante: nombre,
        Fecha: a.fecha,
        Estado: a.estado,
      });
    }
    console.table(rows);

    const setupId = await inquirer.prompt([
      {
        type: "input",
        name: "id",
        message: "Ingrese el ID de la asistencia a editar:",
        validate: (input) => {
          if (input.trim() === "") return "El ID no puede estar vacío.";
          if (isNaN(parseInt(input))) return "Debe ingresar un número válido.";
          return true;
        },
      },
    ]);

    const id = parseInt(setupId.id);
    const index = asistencias.findIndex((a) => a.id === id);
    if (index === -1) {
      console.log(chalk.bgRed.white("No se encontró una asistencia con ese ID."));
      await Helper.esperar();
      return;
    }

    const asistencia = asistencias[index];
    const nombreEst = await this.obtenerNombreEstudiante(asistencia.estudiante_id);
    console.log(
      chalk.bgCyan.white(
        `\nAsistencia: ${nombreEst} - ${asistencia.fecha} - Estado actual: ${asistencia.estado}`,
      ),
    );

    const setupEstado = await inquirer.prompt([
      {
        type: "select",
        name: "estado",
        message: "Seleccione el nuevo estado:",
        choices: [
          { name: "Presente", value: "Presente" },
          { name: "Ausente", value: "Ausente" },
        ],
      },
    ]);

    asistencia.estado = setupEstado.estado;
    await this.asistencia.saveAll(asistencias);

    console.log();
    console.log(chalk.bgGreen.white("Asistencia actualizada exitosamente"));
    await Helper.esperar();
  }

  async eliminarAsistencia() {
    console.clear();
    console.log(chalk.bgRed.white("Eliminar Asistencia"));

    const asistencias = await this.asistencia.load();
    if (asistencias.length === 0) {
      console.log(chalk.bgRed.white("No hay asistencias registradas para eliminar."));
      await Helper.esperar();
      return;
    }

    console.log(chalk.bgBlue.white("Asistencias registradas:"));
    const rows = [];
    for (const a of asistencias) {
      const nombre = await this.obtenerNombreEstudiante(a.estudiante_id);
      rows.push({
        ID: a.id,
        Estudiante: nombre,
        Fecha: a.fecha,
        Estado: a.estado,
      });
    }
    console.table(rows);

    const setupId = await inquirer.prompt([
      {
        type: "input",
        name: "id",
        message: "Ingrese el ID de la asistencia a eliminar:",
        validate: (input) => {
          if (input.trim() === "") return "El ID no puede estar vacío.";
          if (isNaN(parseInt(input))) return "Debe ingresar un número válido.";
          return true;
        },
      },
    ]);

    const id = parseInt(setupId.id);
    const index = asistencias.findIndex((a) => a.id === id);
    if (index === -1) {
      console.log(chalk.bgRed.white("No se encontró una asistencia con ese ID."));
      await Helper.esperar();
      return;
    }

    const nombreEst = await this.obtenerNombreEstudiante(asistencias[index].estudiante_id);
    const confirmacion = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmar",
        message: `¿Está seguro de eliminar la asistencia de "${nombreEst}" del ${asistencias[index].fecha}?`,
        default: false,
      },
    ]);

    if (!confirmacion.confirmar) {
      console.log(chalk.bgCyan.white("Operación cancelada."));
      await Helper.esperar();
      return;
    }

    asistencias.splice(index, 1);
    await this.asistencia.saveAll(asistencias);

    console.log();
    console.log(chalk.bgGreen.white("Asistencia eliminada exitosamente"));
    await Helper.esperar();
  }

  async init() {
    let opcion;
    do {
      console.clear();
      opcion = await Helper.menu("Menú de Asistencia", this.opciones);
      await this.validarMenu(opcion);
    } while (opcion != 0);
  }
}