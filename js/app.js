// Importation des recettes
import { recipes } from "./recipes.js";

// Objet pour stocker les tags actuellement sélectionnés
let currentTags = {
  ingredients: [],
  appliances: [],
  ustensils: [],
};

// Fonction pour afficher les recettes
function displayRecipes(recipesToDisplay) {
  const container = document.getElementById("recipes-container");
  container.innerHTML = "";

  if (recipesToDisplay.length === 0) {
    displayNoResults();
    return;
  }

  recipesToDisplay.forEach((recipe) => {
    const recipeCard = createRecipeCard(recipe);
    container.appendChild(recipeCard);
  });

  updateRecipesCount(recipesToDisplay.length);
}

// Fonction pour créer une carte de recette
function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";

  const ingredientsList = recipe.ingredients
    .map(
      (ing) =>
        `<li><strong>${sanitizeInput(ing.ingredient)}:</strong> ${sanitizeInput(
          ing.quantity || ""
        )} ${sanitizeInput(ing.unit || "")}</li>`
    )
    .join("");

  card.innerHTML = `
    <img src="images/${recipe.image}" alt="${sanitizeInput(recipe.name)}">
    <span class="recipe-time">${recipe.time} min</span>
    <div class="card-body">
      <h5 class="card-title">${sanitizeInput(recipe.name)}</h5>
      <h6>RECETTE</h6>
      <p class="recipe-description">${sanitizeInput(recipe.description)}</p>
      <h6>INGRÉDIENTS</h6>
      <ul class="ingredients-list">
        ${ingredientsList}
      </ul>
    </div>
  `;
  return card;
}

// Fonction pour mettre à jour le nombre de recettes
function updateRecipesCount(count) {
  const recipesNumberElement = document.getElementById("recipes-number");
  recipesNumberElement.textContent = count;
}

// Fonction de recherche utilisant des boucles natives
function searchRecipesNative(query) {
  query = sanitizeInput(query.toLowerCase().trim());

  let filteredRecipes = recipes;

  // Filtrer par tags d'abord
  filteredRecipes = filteredRecipes.filter((recipe) =>
    recipeMatchesTags(recipe)
  );

  // Si la requête a au moins 3 caractères, filtrer également par la recherche
  if (query.length >= 3) {
    filteredRecipes = filteredRecipes.filter((recipe) =>
      recipeMatchesSearch(recipe, query)
    );
  }

  displayRecipes(filteredRecipes);
  updateAdvancedSearchFields(filteredRecipes);
}

// Fonction pour vérifier si une recette correspond à la recherche
function recipeMatchesSearch(recipe, query) {
  return (
    recipe.name.toLowerCase().includes(query) ||
    recipe.description.toLowerCase().includes(query) ||
    recipe.ingredients.some((ing) =>
      ing.ingredient.toLowerCase().includes(query)
    )
  );
}

// Fonction pour vérifier si une recette correspond aux tags
function recipeMatchesTags(recipe) {
  for (const [type, tags] of Object.entries(currentTags)) {
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i].toLowerCase();
      let found = false;

      if (type === "ingredients") {
        found = recipe.ingredients.some((ing) =>
          ing.ingredient.toLowerCase().includes(tag)
        );
      } else if (type === "appliances") {
        found = recipe.appliance.toLowerCase().includes(tag);
      } else if (type === "ustensils") {
        found = recipe.ustensils.some((ust) => ust.toLowerCase().includes(tag));
      }

      if (!found) return false;
    }
  }
  return true;
}
// Fonction pour initialiser les dropdowns
function initializeDropdowns() {
  const dropdowns = ["ingredients", "appliances", "ustensils"];
  dropdowns.forEach((type) => {
    const dropdown = document.querySelector(`#${type}-dropdown`);
    const searchInput = dropdown.querySelector(".dropdown-search");
    const list = document.getElementById(`${type}-list`);

    if (!searchInput || !list) {
      console.error(`Elements not found for ${type} dropdown`);
      return;
    }

    // Populate initial list
    updateDropdownList(`${type}-list`, getUniqueItems(type));

    // Add search functionality
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const items = getUniqueItems(type);
      let filteredItems = items;

      if (searchTerm.length >= 3) {
        filteredItems = items.filter((item) =>
          item.toLowerCase().includes(searchTerm)
        );
      }

      updateDropdownList(
        `${type}-list`,
        filteredItems,
        filteredItems.length === 1
      );
    });
  });
}
// Fonction pour mettre à jour la liste d'un dropdown
function getUniqueItems(type) {
  const items = new Set();
  recipes.forEach((recipe) => {
    if (type === "ingredients") {
      recipe.ingredients.forEach((ing) =>
        items.add(ing.ingredient.toLowerCase())
      );
    } else if (type === "appliances") {
      items.add(recipe.appliance.toLowerCase());
    } else if (type === "ustensils") {
      recipe.ustensils.forEach((ust) => items.add(ust.toLowerCase()));
    }
  });
  return Array.from(items);
}

// Fonction pour mettre à jour les champs de recherche avancée
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

  updateDropdownList("ingredients-list", Array.from(ingredients));
  updateDropdownList("appliances-list", Array.from(appliances));
  updateDropdownList("ustensils-list", Array.from(ustensils));
}

// Fonction pour mettre à jour un dropdown
function updateDropdownList(id, items, singleMatch = false) {
  const list = document.getElementById(id);
  const type = id.split("-")[0];
  list.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    const isSelected = currentTags[type].includes(item.toLowerCase());
    li.innerHTML = `<a class="dropdown-item${isSelected ? " selected" : ""}${
      singleMatch ? " single-match" : ""
    }" href="#">${sanitizeInput(item)}</a>`;

    li.firstChild.addEventListener("click", (e) => {
      e.preventDefault();
      const value = e.target.textContent;
      if (isSelected) {
        removeTag(type, value);
      } else {
        addTag(type, value);
      }
      updateDropdownList(id, getUniqueItems(type));
      document.querySelector(`#${type}-dropdown .dropdown-search`).value = "";
    });

    list.appendChild(li);
  });
}

// Fonction pour ajouter un tag
function addTag(type, value) {
  value = value.toLowerCase();
  if (!currentTags[type].includes(value)) {
    currentTags[type].push(value);
    displayTags();
    searchRecipesNative(document.getElementById("main-search").value);
  }
}

// Fonction pour supprimer un tag
function removeTag(type, value) {
  value = value.toLowerCase();
  const index = currentTags[type].indexOf(value);
  if (index > -1) {
    currentTags[type].splice(index, 1);
    displayTags();
    searchRecipesNative(document.getElementById("main-search").value);
  }
}

// Fonction pour afficher les tags
function displayTags() {
  const tagsContainer = document.getElementById("selected-tags");
  tagsContainer.innerHTML = "";
  for (const [type, tags] of Object.entries(currentTags)) {
    for (let i = 0; i < tags.length; i++) {
      const tagElement = document.createElement("span");
      tagElement.classList.add("tag");
      tagElement.innerHTML = `${sanitizeInput(
        tags[i]
      )} <span class="close">&times;</span>`;
      tagElement
        .querySelector(".close")
        .addEventListener("click", () => removeTag(type, tags[i]));
      tagsContainer.appendChild(tagElement);
    }
  }
}

// Fonction pour afficher un message quand aucune recette n'est trouvée
function displayNoResults() {
  const container = document.getElementById("recipes-container");
  container.innerHTML = `<p>Aucune recette ne correspond à votre critère… vous pouvez chercher « tarte aux pommes », « poisson », etc.</p>`;
}

// Fonction pour nettoyer les entrées utilisateur
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

// Fonction d'initialisation
function init() {
  displayRecipes(recipes);
  updateAdvancedSearchFields(recipes);

  // Assurez-vous que tous les éléments du DOM sont chargés avant d'initialiser les dropdowns
  setTimeout(() => {
    initializeDropdowns();
  }, 0);

  const mainSearch = document.getElementById("main-search");
  mainSearch.addEventListener("input", (e) =>
    searchRecipesNative(e.target.value)
  );
}

document.addEventListener("DOMContentLoaded", init);
