// Wait for the DOM to load
$(document).ready(function () {
  const $placeSection = $('section.places');
  const checkedAmenities = {};
  const checkedStates = {};
  const checkedCities = {};
  const $amenitiesHeader = $('DIV.amenities h4');
  const $locationsHeader = $('DIV.locations h4');

  function handleCheckboxChange ($checkbox, checkedItems, $header) {
    const itemID = $checkbox.data('id');
    const itemName = $checkbox.data('name');

    if ($checkbox.is(':checked')) {
      checkedItems[itemID] = itemName;
    } else {
      delete checkedItems[itemID];
    }

    const checkedItemNames = Object.values(checkedItems).join(', ');
    $header.text(checkedItemNames);
  }

  $('input.amenity_checkbox').on('change', function () {
    handleCheckboxChange($(this), checkedAmenities, $amenitiesHeader);
  });

  $('input.state_checkbox').on('change', function () {
    handleCheckboxChange($(this), checkedStates, $locationsHeader);
  });

  $('input.city_checkbox').on('change', function () {
    const cityID = $(this).data('id');
    const cityName = $(this).data('name');

    if ($(this).is(':checked')) {
      checkedCities[cityID] = cityName;
    } else {
      delete checkedCities[cityID];
    }
  });

  $.get('http://127.0.0.1:5001/api/v1/status/', function (data) {
    $('div#api_status').toggleClass('available', data.status === 'OK');
  });

  getPlaces($placeSection);
  getFilteredPlaces($placeSection, checkedAmenities, checkedStates, checkedCities);
});

function getFilteredPlaces ($section, amenities, states, cities) {
  // Cache the button selector to avoid repeated DOM traversal
  const $button = $('button[type="button"]');

  // Define the click event handler outside the function to avoid creating it multiple times
  function handleClick () {
    const filters = {
      amenities: Object.keys(amenities),
      states: Object.keys(states),
      cities: Object.keys(cities)
    };

    $section.empty();
    getPlaces($section, filters);
  }

  // Attach the click event handler to the button
  $button.on('click', handleClick);
}

function getPlaces ($section, filters = {}) {
  $.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:5001/api/v1/places_search/',
    contentType: 'application/json',
    data: JSON.stringify(filters),
    success: function (places) {
      places.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

      places.forEach(place => {
        const $newArticle = $('<article>');

        addTitleBox($newArticle, place);
        addInformation($newArticle, place);
        addDescription($newArticle, place);
        addReviews($newArticle, place);

        $section.append($newArticle);
      });
    }
  });
}

function addTitleBox ($article, place) {
  const $titleBoxDiv = $('<div>', { class: 'title_box' });
  const $placeByNightDiv = $('<div>', { class: 'price_by_night', text: `$${place.price_by_night}` });
  const $placeNameH2 = $('<h2>', { text: place.name });

  $titleBoxDiv.append($placeNameH2, $placeByNightDiv);
  $article.append($titleBoxDiv);
}

function addInformation ($article, place) {
  const $informationDiv = $('<div>', { class: 'information' });
  const $maxGuestDiv = $('<div>', { class: 'max_guest', text: `${place.max_guest} Guest${place.max_guest !== 1 ? 's' : ''}` });
  const $numberRoomsDiv = $('<div>', { class: 'number_rooms', text: `${place.number_rooms} Bedroom${place.number_rooms !== 1 ? 's' : ''}` });
  const $numberBathroomsDiv = $('<div>', { class: 'number_bathrooms', text: `${place.number_bathrooms} Bathroom${place.number_bathrooms !== 1 ? 's' : ''}` });

  $informationDiv.append($maxGuestDiv, $numberRoomsDiv, $numberBathroomsDiv);
  $article.append($informationDiv);
}

function addDescription ($article, place) {
  const $descriptionDiv = $('<div>', { class: 'description', html: place.description });
  $article.append($descriptionDiv);
}

function addReviews ($article, place) {
  const reviewsUrl = `http://localhost:5001/api/v1/places/${place.id}/reviews`;
  const $reviewsDiv = $('<div>', { class: 'reviews' });
  const $reviewTitleShow = $('<div>', { class: 'review-title-show' });
  const $reviewsTitleH2 = $('<h2>').text('Reviews');
  const $showReviewsSpan = $('<span>', { class: 'show-span', text: 'show', on: { click: toggleReviews } });
  const $reviewsListUl = $('<ul>', { class: 'hidden' });

  $reviewTitleShow.append($reviewsTitleH2, $showReviewsSpan);
  $reviewsDiv.append($reviewTitleShow, $reviewsListUl);
  $article.append($reviewsDiv);

  // Fetch all users first
  $.get('http://localhost:5001/api/v1/users', function (users) {
    const userMap = {}; // Map user IDs to users
    users.forEach(user => {
      userMap[user.id] = user;
    });

    // Fetch reviews
    $.get(reviewsUrl, function (reviews) {
      const reviewsCount = Object.keys(reviews).length;
      $reviewsTitleH2.prepend(`${reviewsCount} `);

      if (reviewsCount !== 0) {
        $showReviewsSpan.text('show');
      }

      reviews.forEach(review => {
        const date = review.created_at.split('T')[0];
        const $reviewItemLi = $('<li>', { class: 'review_item' });
        const $userDateDescH3 = $('<h3>', { class: 'user_date_desc' });
        const $textP = $('<p>', { class: 'text', text: review.text });

        const user = userMap[review.user_id];
        $userDateDescH3.text(`From ${user.first_name} ${user.last_name} the ${date}`);
        $reviewItemLi.append($userDateDescH3, $textP);
        $reviewsListUl.append($reviewItemLi);
      });
    });
  });

  function toggleReviews () {
    $reviewsListUl.toggleClass('hidden');
    $showReviewsSpan.text(($reviewsListUl.hasClass('hidden')) ? 'show' : 'hide');
  }
}
