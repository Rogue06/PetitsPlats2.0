// app.js
import { recipes } from "./recipes.js";

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
        `<li><strong>${ing.ingredient}:</strong> ${ing.quantity || ""} ${
          ing.unit || ""
        }</li>`
    )
    .join("");

  card.innerHTML = `
        <img src="images/${recipe.image}" alt="${recipe.name}">
        <span class="recipe-time">${recipe.time} min</span>
        <div class="card-body">
            <h5 class="card-title">${recipe.name}</h5>
            <h6>RECETTE</h6>
            <p class="recipe-description">${recipe.description}</p>
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

// Fonction de recherche
function searchRecipes(query) {
  const filteredRecipes = recipes.filter((recipe) => {
    const searchString = `${recipe.name} ${
      recipe.description
    } ${recipe.ingredients.map((i) => i.ingredient).join(" ")}`.toLowerCase();

    const matchesQuery =
      query.length < 3 || searchString.includes(query.toLowerCase());
    const matchesTags = Object.entries(currentTags).every(([type, tags]) =>
      tags.every((tag) =>
        type === "ingredients"
          ? recipe.ingredients.some((i) =>
              i.ingredient.toLowerCase().includes(tag.toLowerCase())
            )
          : type === "appliances"
          ? recipe.appliance.toLowerCase().includes(tag.toLowerCase())
          : recipe.ustensils.some((u) =>
              u.toLowerCase().includes(tag.toLowerCase())
            )
      )
    );

    return matchesQuery && matchesTags;
  });

  displayRecipes(filteredRecipes);
  updateAdvancedSearchFields(filteredRecipes);
}

// Fonction pour mettre à jour les champs de recherche avancée
function updateAdvancedSearchFields(filteredRecipes) {
  const ingredients = new Set();
  const appliances = new Set();
  const ustensils = new Set();

  filteredRecipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) =>
      ingredients.add(ing.ingredient.toLowerCase())
    );
    appliances.add(recipe.appliance.toLowerCase());
    recipe.ustensils.forEach((ust) => ustensils.add(ust.toLowerCase()));
  });

  updateDropdownList("ingredients-list", Array.from(ingredients));
  updateDropdownList("appliances-list", Array.from(appliances));
  updateDropdownList("ustensils-list", Array.from(ustensils));
}

// Fonction pour mettre à jour un dropdown
function updateDropdownList(id, items) {
  const list = document.getElementById(id);
  list.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<a class="dropdown-item" href="#">${item}</a>`;
    li.firstChild.addEventListener("click", (e) => {
      e.preventDefault();
      addTag(id.split("-")[0], item);
    });
    list.appendChild(li);
  });
}

// Fonction pour ajouter un tag
function addTag(type, value) {
  if (!currentTags[type].includes(value)) {
    currentTags[type].push(value);
    displayTags();
    searchRecipes(document.getElementById("main-search").value);
  }
}

// Fonction pour supprimer un tag
function removeTag(type, value) {
  currentTags[type] = currentTags[type].filter((tag) => tag !== value);
  displayTags();
  searchRecipes(document.getElementById("main-search").value);
}

// Fonction pour afficher les tags
function displayTags() {
  const tagsContainer = document.getElementById("selected-tags");
  tagsContainer.innerHTML = "";
  Object.entries(currentTags).forEach(([type, tags]) => {
    tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.classList.add("tag");
      tagElement.innerHTML = `${tag} <span class="close">&times;</span>`;
      tagElement
        .querySelector(".close")
        .addEventListener("click", () => removeTag(type, tag));
      tagsContainer.appendChild(tagElement);
    });
  });
}

// Fonction pour afficher un message quand aucune recette n'est trouvée
function displayNoResults() {
  const container = document.getElementById("recipes-container");
  container.innerHTML = `<p>Aucune recette ne correspond à votre critère… vous pouvez chercher « tarte aux pommes », « poisson », etc.</p>`;
}

// Fonction d'initialisation
function init() {
  displayRecipes(recipes);
  updateAdvancedSearchFields(recipes);

  const mainSearch = document.getElementById("main-search");
  mainSearch.addEventListener("input", (e) => searchRecipes(e.target.value));
}

// Lancer l'initialisation quand le DOM est chargé
document.addEventListener("DOMContentLoaded", init);
