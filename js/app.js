import { recipes } from "./recipes.js";
import {
  displayRecipes,
  searchRecipesNative,
  addTag,
  removeTag,
  displayTags,
  initializeDropdowns,
  updateDropdownList,
} from "./components/index.js";

// Objet pour stocker les tags actuellement sélectionnés
let currentTags = {
  ingredients: [],
  appliances: [],
  ustensils: [],
};

function onTagRemove(type, value) {
  removeTag(type, value, currentTags);
  const mainSearchInput = document.getElementById("main-search");
  const filteredRecipes = searchRecipesNative(
    mainSearchInput.value,
    recipes,
    currentTags
  );
  displayRecipes(filteredRecipes);
  updateAdvancedSearchFields(filteredRecipes);
  displayTags(currentTags, onTagRemove);
}

function onTagChange(type, value, isAdding) {
  if (isAdding) {
    addTag(type, value, currentTags);
  } else {
    removeTag(type, value, currentTags);
  }
  displayTags(currentTags, onTagRemove);
  const mainSearchInput = document.getElementById("main-search");
  const filteredRecipes = searchRecipesNative(
    mainSearchInput.value,
    recipes,
    currentTags
  );
  displayRecipes(filteredRecipes);
  updateAdvancedSearchFields(filteredRecipes);
}

function updateAdvancedSearchFields(filteredRecipes) {
  const ingredients = new Set();
  const appliances = new Set();
  const ustensils = new Set();

  for (let i = 0; i < filteredRecipes.length; i++) {
    const recipe = filteredRecipes[i];
    for (let j = 0; j < recipe.ingredients.length; j++) {
      ingredients.add(recipe.ingredients[j].ingredient.toLowerCase());
    }
    appliances.add(recipe.appliance.toLowerCase());
    for (let j = 0; j < recipe.ustensils.length; j++) {
      ustensils.add(recipe.ustensils[j].toLowerCase());
    }
  }

  updateDropdownList(
    "ingredients",
    Array.from(ingredients),
    currentTags,
    onTagChange
  );
  updateDropdownList(
    "appliances",
    Array.from(appliances),
    currentTags,
    onTagChange
  );
  updateDropdownList(
    "ustensils",
    Array.from(ustensils),
    currentTags,
    onTagChange
  );
}

function init() {
  displayRecipes(recipes);
  initializeDropdowns(recipes, currentTags, onTagChange);
  updateAdvancedSearchFields(recipes);
  displayTags(currentTags, onTagRemove);

  const mainSearch = document.getElementById("main-search");
  if (mainSearch) {
    mainSearch.addEventListener("input", (e) => {
      const filteredRecipes = searchRecipesNative(
        e.target.value,
        recipes,
        currentTags
      );
      displayRecipes(filteredRecipes);
      updateAdvancedSearchFields(filteredRecipes);
    });
  } else {
    console.error("Main search input not found");
  }
}

document.addEventListener("DOMContentLoaded", init);
