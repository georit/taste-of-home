/* ++++++++++ VARIABLES ++++++++++ */
const body = document.querySelector("body");
const mealsElement = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");

const searchTerm = document.getElementById("search-term");
const btnSearch = document.getElementById("btn-search");
const btnRandomize = document.getElementById("btn-randomize");
const btnClearSearch = document.querySelector(".btn-clear-search");

const mealPopup = document.getElementById("meal-popup");
const popup = document.querySelector(".popup");
const btnClosePopup = document.getElementById("btn-close-popup");
const mealInfoElement = document.getElementById("meal-info");

/* ++++++++++ ONLOAD ++++++++++ */
// Hide URL bar...
if (!window.location.hash && window.addEventListener) {
  window.addEventListener("load", function () {
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 0);
  });
  window.addEventListener("orientationchange", function () {
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 0);
  });
  window.addEventListener("touchstart", function () {
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 0);
  });
}

// Get random meal...
getRandomMeal();

// Display favorite meal(s)...
favoriteMealsDisplay();

/* ++++++++++ FUNCTIONS ++++++++++ */
// Fetch random meal from API
async function getRandomMeal() {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/random.php`
  );
  const mealData = await response.json();
  const randomMeal = mealData.meals[0];

  addMeal(randomMeal, true);
}

// Fetch meal from API by id
async function getMealById(id) {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );

  const mealData = await response.json();
  const meal = mealData.meals[0];

  return meal;
}

// Fetch meals from API based on a specific search term
async function getMealsBySearch(term) {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`
  );

  const mealData = await response.json();

  const meals = mealData.meals;

  return meals;
}

// Inject meal info into user interface
function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `
	<div class="meal-header">
		${
      random
        ? `<span class="random">
		Random Cocktail
	</span>`
        : ""
    }
		<img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"
			class="meal-img">
	</div>
	<div class="meal-body">
		<h4 class="meal-name">${mealData.strMeal}</h4>
		<button class="btn-favorite"><i class="far fa-heart"></i></button>
	</div>`;

  // Add event listener to favorite button
  meal.querySelector(".btn-favorite").addEventListener("click", () => {
    const btnFavorite = meal.querySelector(".fa-heart");
    const mealsIDs = getMealsFromLocalStorage();

    // Check if favorite button has already been clicked
    if (btnFavorite.className === "far fa-heart" && mealsIDs.length < 4) {
      addMealToLocalStorage(mealData.idMeal);
      btnFavorite.className = "fas fa-heart";
    } else if (
      btnFavorite.className === "fas fa-heart" &&
      mealsIDs.length <= 4
    ) {
      removeMealFromLocalStorage(mealData.idMeal);
      btnFavorite.className = "far fa-heart";
    } else {
      btnFavorite.className = "far fa-heart";
      preventDefault();
    }

    // Fetch favorite meals
    fetchFavoriteMeals();

    // Add instruction to my favorite meals display
    const mealIds = getMealsFromLocalStorage();
    if (mealIds.length === 0) {
      addInstruction();
    }
  });

  // Add event listener to meal image
  const mealImg = meal.querySelector("img");

  mealImg.addEventListener("click", () => {
    // Show instructions and ingredients
    showMealInfo(mealData);
  });

  // Add event listener to meal name
  const mealName = meal.querySelector(".meal-name");
  mealName.addEventListener("click", () => {
    // Show instructions and ingredients
    showMealInfo(mealData);
  });

  mealsElement.appendChild(meal);
}

// Add a favorited meal to local storage
function addMealToLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

// Remove a favorited meal from storage
function removeMealFromLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(
      mealIds.filter((id) => {
        return id !== mealId;
      })
    )
  );
}

// Get favorite meals from local storage
function getMealsFromLocalStorage() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

// Fetch favorite meals
async function fetchFavoriteMeals() {
  // Clean up favorite meals list
  favoriteContainer.innerHTML = "";

  const mealIds = getMealsFromLocalStorage();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];

    meal = await getMealById(mealId);

    addMealToFavorites(meal);
  }
}

// Display a meal under 'my favorite meals'
function addMealToFavorites(mealData) {
  const favoriteMeal = document.createElement("li");

  favoriteMeal.innerHTML = `
	<img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"><span>${mealData.strMeal}</span>
	<button class="btn-clear"><i class="fas fa-times-circle"></i></button>`;

  const btnClear = favoriteMeal.querySelector(".btn-clear");

  // Add event listener to favorite button
  btnClear.addEventListener("click", (e) => {
    removeMealFromLocalStorage(mealData.idMeal);

    // Check if currently displayed random meal is favorited
    const meal = document.querySelector(".meal");
    const mealName = meal.querySelector("h4").textContent;
    const btnFavorite = meal.querySelector(".fa-heart");
    const favoritedMeal = e.target.parentElement.parentElement;
    const favoritedMealName = favoritedMeal.querySelector("span").textContent;

    if (
      btnFavorite.className === "fas fa-heart" &&
      mealName === favoritedMealName
    ) {
      btnFavorite.className = "far fa-heart";
    } else if (getMealsFromLocalStorage() === []) {
      btnFavorite.className = "far fa-heart";
    }

    // Fetch favorite meals
    fetchFavoriteMeals();

    // Add instruction to my favorite meals display
    const mealIds = getMealsFromLocalStorage();
    if (mealIds.length === 0) {
      addInstruction();
    }
  });

  // Add event listener to the favorite meal image
  const favoriteMealImg = favoriteMeal.querySelector("img");

  favoriteMealImg.addEventListener("click", () => {
    // Show instructions and ingredients
    showMealInfo(mealData);
  });

  favoriteContainer.appendChild(favoriteMeal);
}

// Display either favorite meals or instruction if there are no favorited meals
function favoriteMealsDisplay() {
  const mealIds = getMealsFromLocalStorage();

  if (mealIds.length === 0) {
    addInstruction();
  } else {
    fetchFavoriteMeals();
  }
}

// Display instruction under 'my favorite meals'
function addInstruction() {
  const instruction = document.createElement("li");

  instruction.innerHTML = `<span>tap <i class="far fa-heart"></i></span>`;
  instruction.classList.add("instruction");

  favoriteContainer.appendChild(instruction);
  // Add style to instruction
}

// Show mix instructions and ingredients
function showMealInfo(mealData) {
  // toggle scroll on body
  toggleScrollOnBody();
  // Clean up html
  mealInfoElement.innerHTML = "";
  // Update meal info
  const mealEl = document.createElement("div");

  // Get ingredients and measurements
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  // Get mixing instructions
  const instructions = mealData.strInstructions
    .split("\n")
    .filter((i) => i.trim() !== "");

  // Inject ingredients and mixing instructions into user interface
  mealEl.innerHTML = `
	<h1>${mealData.strMeal}</h1>
	<img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="mix-img">
	<h3>Ingredients</h3>
	<ul class="mix-ingredients">
	${ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("")}
	</ul>
	<h3>Instructions</h3>    
	<ul class="mix-instructions">
	${instructions.map((instruct) => `<li>${instruct}</li>`).join("")}
	</ul>`;

  // Add mix info to popup display
  mealInfoElement.appendChild(mealEl);

  // Show the popup
  mealPopup.classList.remove("hidden");
}

// Toggle scrolling on body
function toggleScrollOnBody() {
  body.classList.toggle("scroll");
  body.classList.toggle("noscroll");
}

// Get meals using search input
async function searchForMeals() {
  // Clean up search results
  mealsElement.innerHTML = "";

  const search = searchTerm.value;

  const meals = await getMealsBySearch(search);

  if (meals) {
    // Clean up HTML
    mealsElement.innerHTML = "";
    // Inject meals to user interface
    meals.forEach((meal) => {
      // Inject meal into user interface
      addMeal(meal);
      mealsElement.classList.remove("no-results-for-search");
    });
  } else {
    showErrorMessage();
  }
}

// Show error message
function showErrorMessage() {
  // displace search results message
  mealsElement.innerHTML = `
	<img class="no-results-for-search-img" src="./img/sad_face.png">
	<p>No search results for <span class="search-word">"${searchTerm.value}"</span>, try searching for a different meal or ingredient.</p>
	`;
  mealsElement.classList.add("no-results-for-search");

  // center search results message
  mealsElement.style.justifyContent = "center";
}

// Show clear search button
function showClearSearchBtn() {
  btnClearSearch.classList.add("show-btn-clear-search");
}

// Hide clear search button
function hideClearSearchBtn() {
  if (btnClearSearch.classList.contains("show-btn-clear-search")) {
    btnClearSearch.classList.remove("show-btn-clear-search");
  }
}

/* ++++++++++ EVENT LISTENERS ++++++++++ */
// Add event listener to the search button
btnSearch.addEventListener("click", () => {
  // Hide clear search button
  hideClearSearchBtn();
  // Search for meals
  searchForMeals();
});

// Add event listener to search input to show search clear button whenever there's text in the search field
searchTerm.addEventListener("focusin", () => {
  if (searchTerm.value.length > 0) {
    showClearSearchBtn();
  }
});

// Add event lister to search input for submitting with enter and showing clear search term button
searchTerm.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    // hide keyboard
    searchTerm.blur();
    // hide clear search button
    hideClearSearchBtn();
    // Search for meals
    searchForMeals();
  } else {
    // Show clear search button
    showClearSearchBtn();
  }

  if (searchTerm.value.length === 0) {
    // Hide clear search button
    hideClearSearchBtn();
  }
});

// Add event listener to the clear search button
btnClearSearch.addEventListener("click", () => {
  // Clear search field
  searchTerm.value = "";
  // Hide clear search button
  hideClearSearchBtn();
});

// Add event listener to the popup close button
btnClosePopup.addEventListener("click", () => {
  // toggle scroll on body
  toggleScrollOnBody();
  // hide instructions and ingredients
  mealPopup.classList.add("hidden");
  // Clean up HTML
  mealInfoElement.innerHTML = "";
  // Reset scroll position
  mealInfoElement.scrollTop = 0;
});

// Add event listener to the randomize button
btnRandomize.addEventListener("click", () => {
  // Clean up html
  mealsElement.classList.remove("no-results-for-search");
  mealsElement.innerHTML = "";
  mealInfoElement.innerHTML = "";

  // Get random meal
  getRandomMeal();
  // Hide clear search button
  hideClearSearchBtn();
});
