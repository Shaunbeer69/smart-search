const fs = require('fs');
const csv = require('csv-parser');

const seedCsvData = async (filePath) => {
  const data = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      row.updatedAt = new Date();
      row.createdAt = new Date();
      data.push(row);
    })
      .on('end', () => resolve(data))
      .on('error', (error) => reject(error));
  });
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const brands = await seedCsvData('./data/brands.csv');
    await queryInterface.bulkInsert('Brands', brands, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Brands', null, {});
  }
};
