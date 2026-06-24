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
   async read() {
    console.log(chalk.bgBlue.white("Mostrando estudiantes..."));
    console.log();

    const estudiantes = await this.estudiante.load();
    const secciones = await this.seccion.load();

    const rows = estudiantes.map((e) => {
      const seccion = secciones.find((s) => s.id === e.seccion_id);
      return {
        ID: e.id,
        Nombre: e.nombre,
        Sexo: e.sexo,
        Edad: e.edad,
        Seccion: seccion ? seccion.nombre : `ID: ${e.seccion_id}`,
      };
    });

    console.table(rows);
    console.log();
    await Helper.esperar();
  }

    async update() {
    console.clear();
    console.log(chalk.bgYellow.white("Editando estudiante..."));

    const estudiantes = await this.estudiante.load();
    if (estudiantes.length === 0) {
      console.log(chalk.bgRed.white("No hay estudiantes registrados para editar."));
      await Helper.esperar();
      return;
    }

    const secciones = await this.seccion.load();

    console.log(chalk.bgBlue.white("Estudiantes registrados:"));
    const rows = estudiantes.map((e) => {
      const seccion = secciones.find((s) => s.id === e.seccion_id);
      return {
        ID: e.id,
        Nombre: e.nombre,
        Sexo: e.sexo,
        Edad: e.edad,
        Seccion: seccion ? seccion.nombre : `ID: ${e.seccion_id}`,
      };
    });
    console.table(rows);

    let payload = await inquirer.prompt([
      {
        type: "input",
        name: "id",
        message: "Ingrese el ID del estudiante a editar:",
        validate: (input) => {
          if (input.trim() === "") return "El ID no puede estar vacío.";
          if (isNaN(parseInt(input))) return "Debe ingresar un número válido.";
          return true;
        },
      },
    ]);

    const id = parseInt(payload.id);
    const index = estudiantes.findIndex((e) => e.id === id);
    if (index === -1) {
      console.log(chalk.bgRed.white("No se encontró un estudiante con ese ID."));
      await Helper.esperar();
      return;
    }

    const estudiante = estudiantes[index];
    const seccionActual = secciones.find((s) => s.id === estudiante.seccion_id);
    console.log(
      chalk.bgCyan.white(
        "Deje el campo en blanco para mantener el valor actual.",
      ),
    );

    let nuevosDatos = await inquirer.prompt([
      {
        type: "input",
        name: "nombre",
        message: `Nombre [${estudiante.nombre}]:`,
      },
      {
        type: "input",
        name: "sexo",
        message: `Sexo (M/F) [${estudiante.sexo}]:`,
      },
      {
        type: "input",
        name: "edad",
        message: `Edad [${estudiante.edad}]:`,
      },
    ]);

    if (nuevosDatos.nombre.trim() !== "") estudiante.nombre = nuevosDatos.nombre.trim();
    if (nuevosDatos.sexo.trim() !== "") estudiante.sexo = nuevosDatos.sexo.trim();
    if (nuevosDatos.edad.trim() !== "") estudiante.edad = parseInt(nuevosDatos.edad.trim());

    if (secciones.length > 0) {
      const cambiarSeccion = await inquirer.prompt([
        {
          type: "confirm",
          name: "cambiar",
          message: `¿Desea cambiar la sección actual (${seccionActual ? seccionActual.nombre : "N/A"})?`,
          default: false,
        },
      ]);

      if (cambiarSeccion.cambiar) {
        const nuevaSeccion = await inquirer.prompt([
          {
            type: "select",
            name: "seccion",
            message: "Seleccione la nueva sección:",
            choices: secciones.map((s) => ({
              name: s.nombre,
              value: s,
            })),
          },
        ]);
        estudiante.seccion_id = nuevaSeccion.seccion.id;
      }
    }

    await this.estudiante.saveAll(estudiantes);

    console.log();
    console.log(chalk.bgGreen.white("Estudiante actualizado exitosamente"));
    await Helper.esperar();
  }
  async delete() {
    console.clear();
    console.log(chalk.bgRed.white("Eliminando estudiante..."));

    const estudiantes = await this.estudiante.load();
    if (estudiantes.length === 0) {
      console.log(chalk.bgRed.white("No hay estudiantes registrados para eliminar."));
      await Helper.esperar();
      return;
    }

    const secciones = await this.seccion.load();

    console.log(chalk.bgBlue.white("Estudiantes registrados:"));
    const rows = estudiantes.map((e) => {
      const seccion = secciones.find((s) => s.id === e.seccion_id);
      return {
        ID: e.id,
        Nombre: e.nombre,
        Sexo: e.sexo,
        Edad: e.edad,
        Seccion: seccion ? seccion.nombre : `ID: ${e.seccion_id}`,
      };
    });
    console.table(rows);

    let payload = await inquirer.prompt([
      {
        type: "input",
        name: "id",
        message: "Ingrese el ID del estudiante a eliminar:",
        validate: (input) => {
          if (input.trim() === "") return "El ID no puede estar vacío.";
          if (isNaN(parseInt(input))) return "Debe ingresar un número válido.";
          return true;
        },
      },
    ]);

    const id = parseInt(payload.id);
    const index = estudiantes.findIndex((e) => e.id === id);
    if (index === -1) {
      console.log(chalk.bgRed.white("No se encontró un estudiante con ese ID."));
      await Helper.esperar();
      return;
    }

    const confirmacion = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmar",
        message: `¿Está seguro de eliminar al estudiante "${estudiantes[index].nombre}"?`,
        default: false,
      },
    ]);

    if (!confirmacion.confirmar) {
      console.log(chalk.bgCyan.white("Operación cancelada."));
      await Helper.esperar();
      return;
    }

    estudiantes.splice(index, 1);
    await this.estudiante.saveAll(estudiantes);

    console.log();
    console.log(chalk.bgGreen.white("Estudiante eliminado exitosamente"));
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