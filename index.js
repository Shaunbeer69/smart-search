const express = require('express');
const { Op } = require('sequelize');
const { sequelize, City, Brand, DishType, Diet } = require('./models/index.js');

const app = express();
const port = 3000;

// Configure Express to parse JSON body
app.use(express.json());

const extractEntities = async (searchTerm) => {
    const terms = searchTerm.split(' ').filter(term => term !== 'in' && term !== 'or' && term !== 'and');
    const likeClauses = terms.map(term => `%${term}%`);

    const whereClauses = likeClauses.map(() => 'name ILIKE ?').join(' OR ');

    const query = `SELECT 'City' AS entityType, id, name FROM "Cities" WHERE (${whereClauses}) UNION ALL SELECT 'Brand' AS entityType, id, name FROM "Brands" WHERE (${whereClauses}) UNION ALL SELECT 'DishType' AS entityType, id, name FROM "DishTypes" WHERE (${whereClauses}) UNION ALL SELECT 'Diet' AS entityType, id, name FROM "Diets" WHERE (${whereClauses})`;

    try {
        // Execute the query directly without replacements
        const results = removeDuplicateObjects(await sequelize.query(query, {
            replacements: [].concat(...likeClauses, ...likeClauses, ...likeClauses, ...likeClauses),
            type: sequelize.QueryTypes.SELECT
        }));

   
        const cities = results.filter(result => {return result.entitytype === 'City'});
        const brands =  results.filter(result => result.entitytype === 'Brand');
        const dishTypes =  results.filter(result => result.entitytype === 'DishType');
        const diets =  results.filter(result => result.entitytype === 'Diet');
    

        return generateCombinations(cities, brands, dishTypes, diets);
    } catch (error) {
        console.error('Error executing SQL query:', error);
        throw error; // Rethrow the error for handling in the caller function
    }
};


function removeDuplicateObjects(arr) {
    const uniqueSet = new Set();

    // Filter out duplicates based on the entire object content
    const uniqueArray = arr.filter(obj => {
        const strRepresentation = JSON.stringify(obj);
        if (!uniqueSet.has(strRepresentation)) {
            uniqueSet.add(strRepresentation);
            return true;
        }
        return false;
    });

    return uniqueArray;
}




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
