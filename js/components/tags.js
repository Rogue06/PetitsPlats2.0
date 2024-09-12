import { sanitizeInput } from "./utils.js";

export function addTag(type, value, currentTags) {
  value = value.toLowerCase();
  if (!currentTags[type].includes(value)) {
    currentTags[type].push(value);
    return true;
  }
  return false;
}

export function removeTag(type, value, currentTags) {
  value = value.toLowerCase();
  const index = currentTags[type].indexOf(value);
  if (index > -1) {
    currentTags[type].splice(index, 1);
    return true;
  }
  return false;
}

export function displayTags(currentTags, onTagRemove) {
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
        .addEventListener("click", () => onTagRemove(type, tags[i]));
      tagsContainer.appendChild(tagElement);
    }
  }
}
