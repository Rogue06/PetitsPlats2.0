import { sanitizeInput } from "./utils.js";

export function searchRecipesNative(query, recipes, currentTags) {
  query = sanitizeInput(query.toLowerCase().trim());

  let filteredRecipes = [];

  // Filtrer par tags d'abord
  for (let i = 0; i < recipes.length; i++) {
    if (recipeMatchesTags(recipes[i], currentTags)) {
      filteredRecipes.push(recipes[i]);
    }
  }

  // Si la requête a au moins 3 caractères, filtrer également par la recherche
  if (query.length >= 3) {
    let searchFilteredRecipes = [];
    for (let i = 0; i < filteredRecipes.length; i++) {
      if (recipeMatchesSearch(filteredRecipes[i], query)) {
        searchFilteredRecipes.push(filteredRecipes[i]);
      }
    }
    filteredRecipes = searchFilteredRecipes;
  }

  return filteredRecipes;
}

export function recipeMatchesSearch(recipe, query) {
  if (recipe.name.toLowerCase().includes(query)) return true;
  if (recipe.description.toLowerCase().includes(query)) return true;
  for (let i = 0; i < recipe.ingredients.length; i++) {
    if (recipe.ingredients[i].ingredient.toLowerCase().includes(query))
      return true;
  }
  return false;
}

export function recipeMatchesTags(recipe, currentTags) {
  for (const [type, tags] of Object.entries(currentTags)) {
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i].toLowerCase();
      let found = false;

      if (type === "ingredients") {
        for (let j = 0; j < recipe.ingredients.length; j++) {
          if (recipe.ingredients[j].ingredient.toLowerCase().includes(tag)) {
            found = true;
            break;
          }
        }
      } else if (type === "appliances") {
        found = recipe.appliance.toLowerCase().includes(tag);
      } else if (type === "ustensils") {
        for (let j = 0; j < recipe.ustensils.length; j++) {
          if (recipe.ustensils[j].toLowerCase().includes(tag)) {
            found = true;
            break;
          }
        }
      }

      if (!found) return false;
    }
  }
  return true;
}
