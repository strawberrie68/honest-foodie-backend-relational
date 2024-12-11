const prisma = require("../config/prisma");

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create({ data });
  }

  async findById(id) {
    return this.model.findUnique({ where: { id } });
  }

  async findAll(options = {}) {
    return this.model.findMany(options);
  }

  async update(id, data) {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return this.model.delete({ where: { id } });
  }
}

module.exports = BaseRepository;
