const express = require('express');
const { Op } = require('sequelize');
const { sequelize, City, Brand, DishType, Diet } = require('./models/index.js');

const app = express();
const port = 3000;

// Configure Express to parse JSON body
app.use(express.json());


const extractEntities = async (searchTerm) => {
    const terms = searchTerm.split(' ');

    // Initialize sets to store found entities
    const cities = new Set();
    const brands = new Set();
    const dishTypes = new Set();
    const diets = new Set();

    // Loop through each term to identify entities
    for (const term of terms) {
        if (term === 'in' || term === 'or' || term === 'and') { continue; }

        const city = await City.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${term}%` // Using case-insensitive partial match
                }
            }
        });
        city.forEach(c => cities.add(c));

        const brand = await Brand.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${term}%` // Using case-insensitive partial match
                }
            }
        });
        brand.forEach(b => brands.add(b));

        const dishType = await DishType.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${term}%` // Using case-insensitive partial match
                }
            }
        });
        dishType.forEach(d => dishTypes.add(d));

        const diet = await Diet.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${term}%` // Using case-insensitive partial match
                }
            }
        });
        diet.forEach(d => diets.add(d));
    }

    // Convert sets to arrays
    const uniqueCities = Array.from(cities);
    const uniqueBrands = Array.from(brands);
    const uniqueDishTypes = Array.from(dishTypes);
    const uniqueDiets = Array.from(diets);

    return generateCombinations(uniqueCities, uniqueBrands, uniqueDishTypes, uniqueDiets);
};




function generateCombinations(cities, brands, dishTypes, diets) {
    const combinationsSet = new Set();
    const combinations = [];
    const iterableArrays = [cities, brands, dishTypes, diets].filter(arr => arr && arr.length);

    // Find the maximum length among iterable arrays
    const maxLength = Math.max(...iterableArrays.map(arr => arr.length));

    // Iterate over each combination index up to the maximum length
    for (let cityIndex = 0; cityIndex < maxLength; cityIndex++) {
        for (let brandIndex = 0; brandIndex < maxLength; brandIndex++) {
            for (let dishIndex = 0; dishIndex < maxLength; dishIndex++) {
                for (let dietIndex = 0; dietIndex < maxLength; dietIndex++) {
                    const combination = {};

                    // Add city if available and iterable
                    if (cities && cities.length && cities[cityIndex]) {
                        combination.city = { id: cities[cityIndex].id, name: cities[cityIndex].name };
                    }

                    // Add brand if available and iterable
                    if (brands && brands.length && brands[brandIndex]) {
                        combination.brand = { id: brands[brandIndex].id, name: brands[brandIndex].name };
                    }

                    // Add dish type if available and iterable
                    if (dishTypes && dishTypes.length && dishTypes[dishIndex]) {
                        combination.dishType = { id: dishTypes[dishIndex].id, name: dishTypes[dishIndex].name };
                    }

                    // Add diet if available and iterable
                    if (diets && diets.length && diets[dietIndex]) {
                        combination.diet = { id: diets[dietIndex].id, name: diets[dietIndex].name };
                    }

                    // Check if the combination contains an instance of each iterable array
                    const containsAllArrays = iterableArrays.every((arr, index) => arr && arr.length && combination.hasOwnProperty(Object.keys(combination)[index]));

                    if (containsAllArrays) {
                        // Convert combination to a string for Set comparison
                        const combinationString = JSON.stringify(combination);

                        // Check for duplicates
                        if (!combinationsSet.has(combinationString)) {
                            // Add combination to set and array
                            combinationsSet.add(combinationString);
                            combinations.push(combination);
                        }
                    }
                }
            }
        }
    }

    return combinations;
}







app.post('/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;
    const entities = await extractEntities(searchTerm);
    res.json(entities);
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
