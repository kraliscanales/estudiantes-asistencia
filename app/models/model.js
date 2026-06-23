import fs from "fs/promises";
export default class Model {
  table = "models";
  getTable() {
    return this.table;
  }
  async save(payload) {
    let datos = await this.load();
    datos.push(payload);

    await fs.writeFile(
      `db/${this.getTable()}.json`,
      JSON.stringify(datos, null, 2),
    );
    return payload;
  }

  async saveAll(datos) {
    await fs.writeFile(
      `db/${this.getTable()}.json`,
      JSON.stringify(datos, null, 2),
    );
  }

  async load() {
    try {
      const data = await fs.readFile(`db/${this.getTable()}.json`, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
}
