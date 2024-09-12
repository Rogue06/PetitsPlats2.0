import { sanitizeInput } from "./utils.js";

export function displayRecipes(recipesToDisplay) {
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

export function createRecipeCard(recipe) {
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

export function updateRecipesCount(count) {
  const recipesNumberElement = document.getElementById("recipes-number");
  recipesNumberElement.textContent = count;
}

export function displayNoResults() {
  const container = document.getElementById("recipes-container");
  container.innerHTML = `<p>Aucune recette ne correspond à votre critère… vous pouvez chercher « tarte aux pommes », « poisson », etc.</p>`;
}
