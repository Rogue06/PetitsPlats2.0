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
  if (recipe.name.toLowerCase().includes(query)) return true;
  if (recipe.description.toLowerCase().includes(query)) return true;

  for (let i = 0; i < recipe.ingredients.length; i++) {
    if (recipe.ingredients[i].ingredient.toLowerCase().includes(query)) {
      return true;
    }
  }

  return false;
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
function updateDropdownList(id, items) {
  const list = document.getElementById(id);
  list.innerHTML = "";
  for (let i = 0; i < items.length; i++) {
    const li = document.createElement("li");
    li.innerHTML = `<a class="dropdown-item" href="#">${sanitizeInput(
      items[i]
    )}</a>`;
    li.firstChild.addEventListener("click", (e) => {
      e.preventDefault();
      addTag(id.split("-")[0], items[i]);
    });
    list.appendChild(li);
  }
}

// Fonction pour ajouter un tag
function addTag(type, value) {
  if (!currentTags[type].includes(value)) {
    currentTags[type].push(value);
    displayTags();
    searchRecipesNative(document.getElementById("main-search").value);
  }
}

// Fonction pour supprimer un tag
function removeTag(type, value) {
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
  searchRecipesNative(""); // Ceci affichera toutes les recettes au départ
  updateAdvancedSearchFields(recipes);

  const mainSearch = document.getElementById("main-search");
  mainSearch.addEventListener("input", (e) =>
    searchRecipesNative(e.target.value)
  );
}

// Lancer l'initialisation quand le DOM est chargé
document.addEventListener("DOMContentLoaded", init);
