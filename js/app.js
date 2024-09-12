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

// Fonction de recherche utilisant des boucles FOR
function searchRecipesNative(query) {
  query = sanitizeInput(query.toLowerCase().trim());

  let filteredRecipes = [];

  // Filtrer par tags d'abord
  for (let i = 0; i < recipes.length; i++) {
    if (recipeMatchesTags(recipes[i])) {
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

  displayRecipes(filteredRecipes);
  updateAdvancedSearchFields(filteredRecipes);
  updateRecipesCount(filteredRecipes.length);
}
// Fonction vérifie si une recette correspond à la requête
function recipeMatchesSearch(recipe, query) {
  if (recipe.name.toLowerCase().includes(query)) return true;
  if (recipe.description.toLowerCase().includes(query)) return true;
  for (let i = 0; i < recipe.ingredients.length; i++) {
    if (recipe.ingredients[i].ingredient.toLowerCase().includes(query))
      return true;
  }
  return false;
}
// Fonction vérifie si une recette correspond de tags
function recipeMatchesTags(recipe) {
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

// Fonction pour mettre à jour les champs de recherche avancées
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

  updateDropdownList("ingredients", Array.from(ingredients));
  updateDropdownList("appliances", Array.from(appliances));
  updateDropdownList("ustensils", Array.from(ustensils));
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
  const result = Array.from(items);
  return result;
}

// Fonction pour mettre à jour un dropdown
function updateDropdownList(type, items) {
  const dropdownMap = {
    ingredients: "Ingrédients",
    appliances: "Appareils",
    ustensils: "Ustensiles",
  };

  const dropdowns = document.querySelectorAll(".dropdown");
  let dropdown;
  for (let i = 0; i < dropdowns.length; i++) {
    if (dropdowns[i].textContent.trim().includes(dropdownMap[type])) {
      dropdown = dropdowns[i];
      break;
    }
  }

  if (!dropdown) {
    console.error(`Dropdown not found for ${type}`);
    return;
  }

  let list = dropdown.querySelector("ul");
  if (!list) {
    list = document.createElement("ul");
    list.id = `${type}-list`;
    dropdown.querySelector(".dropdown-menu").appendChild(list);
  }
  // Supprimer tous les éléments de la liste
  list.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    const isSelected = currentTags[type].includes(item.toLowerCase());
    li.innerHTML = `<a class="dropdown-item${
      isSelected ? " selected" : ""
    }" href="#">${sanitizeInput(item)}</a>`;

    li.firstChild.addEventListener("click", (e) => {
      e.preventDefault();
      const value = e.target.textContent;
      if (isSelected) {
        removeTag(type, value);
      } else {
        addTag(type, value);
      }
      const searchInput = dropdown.querySelector(".dropdown-search");
      if (searchInput) {
        searchInput.value = "";
      }
      searchRecipesNative(document.getElementById("main-search").value);
    });

    list.appendChild(li);
  });
}

// Fonction pour initialiser tous les dropdowns (Menus déroulants)
function initializeDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach((dropdown) => {
    const type = dropdown.textContent.trim().toLowerCase();
    let mappedType;
    if (type.includes("ingrédients")) mappedType = "ingredients";
    else if (type.includes("appareils")) mappedType = "appliances";
    else if (type.includes("ustensiles")) mappedType = "ustensils";
    else return;

    let dropdownMenu = dropdown.querySelector(".dropdown-menu");
    if (!dropdownMenu) {
      console.error(`Dropdown menu not found for ${mappedType}`);
      return;
    }

    // Ajouter un gestionnaire d'événements pour ouvrir/fermer le menu
    dropdown.addEventListener("click", (e) => {
      if (e.target.closest(".dropdown-menu")) return; // Ne pas fermer si on clique dans le menu
      dropdownMenu.classList.toggle("show");
    });

    // Fermer le menu si on clique en dehors
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        dropdownMenu.classList.remove("show");
      }
    });

    let searchInput = dropdownMenu.querySelector(".dropdown-search");
    if (!searchInput) {
      searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.className = "dropdown-search";
      searchInput.placeholder = `Rechercher un ${mappedType.slice(0, -1)}`;
      dropdownMenu.insertBefore(searchInput, dropdownMenu.firstChild);
    }

    let list = dropdownMenu.querySelector(`ul`);
    if (!list) {
      list = document.createElement("ul");
      list.id = `${mappedType}-list`;
      dropdownMenu.appendChild(list);
    }

    const allItems = getUniqueItems(mappedType);

    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      let filteredItems = allItems;

      if (searchTerm.length > 0) {
        filteredItems = allItems.filter((item) =>
          item.toLowerCase().includes(searchTerm)
        );
      }
      updateDropdownList(mappedType, filteredItems);
    });

    // Mise à jour initiale de la liste déroulante
    updateDropdownList(mappedType, allItems);
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

// Fonction pour afficher les tags sélectionnés sous la barre de recherche principale
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

// Fonction d'initialisation (dropdowns, tags, etc...)
function init() {
  displayRecipes(recipes);
  initializeDropdowns(); // Appel direct, sans setTimeout
  updateAdvancedSearchFields(recipes);

  const mainSearch = document.getElementById("main-search");
  if (mainSearch) {
    mainSearch.addEventListener("input", (e) =>
      searchRecipesNative(e.target.value)
    );
  } else {
    console.error("Main search input not found");
  }
}

document.addEventListener("DOMContentLoaded", init);
