import { sanitizeInput } from "./utils.js";

export function initializeDropdowns(recipes, currentTags, onTagChange) {
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

    const allItems = getUniqueItems(mappedType, recipes);

    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      let filteredItems = allItems;

      if (searchTerm.length > 0) {
        filteredItems = allItems.filter((item) =>
          item.toLowerCase().includes(searchTerm)
        );
      }
      updateDropdownList(mappedType, filteredItems, currentTags, onTagChange);
    });

    // Mise à jour initiale de la liste déroulante
    updateDropdownList(mappedType, allItems, currentTags, onTagChange);
  });
}

export function updateDropdownList(type, items, currentTags, onTagChange) {
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
        onTagChange(type, value, false);
      } else {
        onTagChange(type, value, true);
      }
      const searchInput = dropdown.querySelector(".dropdown-search");
      if (searchInput) {
        searchInput.value = "";
      }
    });

    list.appendChild(li);
  });
}

export function getUniqueItems(type, recipes) {
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
