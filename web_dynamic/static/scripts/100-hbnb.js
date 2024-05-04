// Wait for the DOM to load
$('document').ready(function () {
  const $placeSection = $('section.places');
  const checkedAmenities = {};
  const checkedStates = {};
  const checkedCities = {};

  // Select all amenity checkbox input tags
  $('input.amenity_checkbox').on('change', function () {
    // Get the amenity ID of the checkbox
    const amenityID = $(this).data('id');
    const amenityName = $(this).data('name');

    // Check if the amenity is checked
    if ($(this).is(':checked')) {
      // Checkbox is checked. Add the ID to the list
      checkedAmenities[amenityID] = amenityName;
    } else {
      // Checkbox is unchecked. Remove the ID if in the list
      delete checkedAmenities[amenityID];
    }

    // Get all checked amenities in a single string
    const checkedAmenityNames = Object.values(checkedAmenities).join(', ');

    // Update the h4 tag inside div amenities with the amenities checked
    $('DIV.amenities h4').text(checkedAmenityNames);
  });

  // Select all state checkbox input tags
  $('input.state_checkbox').on('change', function () {
    // Get the state ID of the checkbox
    const stateID = $(this).data('id');
    const stateName = $(this).data('name');

    // Check if the state is checked
    if ($(this).is(':checked')) {
      // Checkbox is checked. Add the ID to the list
      checkedStates[stateID] = stateName;
    } else {
      // Checkbox is unchecked. Remove the ID if in the list
      delete checkedStates[stateID];
    }

    // Get all checked states in a single string
    const checkedStateNames = Object.values(checkedStates).join(', ');

    // Update the h4 tag inside div locations with the states checked
    $('DIV.locations h4').text(checkedStateNames);
  });

  // Select all city checkbox input tags
  $('input.city_checkbox').on('change', function () {
    // Get the city ID of the checkbox
    const cityID = $(this).data('id');
    const cityName = $(this).data('name');

    // Check if the city is checked
    if ($(this).is(':checked')) {
      // Checkbox is checked. Add the ID to the list
      checkedCities[cityID] = cityName;
    } else {
      // Checkbox is unchecked. Remove the ID if in the list
      delete checkedCities[cityID];
    }
  });

  // Check API status
  $.get('http://127.0.0.1:5001/api/v1/status/', function (data) {
    if (data.status === 'OK') {
      $('div#api_status').addClass('available');
    } else {
      $('div#api_status').removeClass('available');
    }
  });

  getPlaces($placeSection);

  getFilteredPlaces($placeSection, checkedAmenities, checkedStates, checkedCities);
});

function getFilteredPlaces ($section, amenities, states, cities) {
  $('button[type="button"]').on('click', function () {
    const amenityIDs = Object.keys(amenities);
    const stateIDs = Object.keys(states);
    const cityIDs = Object.keys(cities);
    const filters = {
      amenities: amenityIDs,
      states: stateIDs,
      cities: cityIDs
    };

    $section.empty();
    getPlaces($section, filters);
  });
}

function getPlaces ($section, filters = {}) {
  $.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:5001/api/v1/places_search/',
    contentType: 'application/json',
    data: JSON.stringify(filters),
    success: function (places) {
      // Sort places by place name
      places.sort(function (a, b) {
        // Convert both names to lowercase to ensure case-insensitive sorting
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      // Dynamically load places
      $.each(places, function (i, place) {
        const $newArticle = $('<article>');

        addTitleBox($newArticle, place);
        addInformation($newArticle, place);
        addDecription($newArticle, place);

        $section.append($newArticle);
      });
    }
  });
}

function addTitleBox ($article, place) {
  const $titleBoxDiv = $('<div>').addClass('title_box');
  const $placeByNightDiv = $('<div>').addClass('price_by_night').text('$' + place.price_by_night);
  const $placeNameH2 = $('<h2>').text(place.name);

  $titleBoxDiv.append($placeNameH2);
  $titleBoxDiv.append($placeByNightDiv);
  $article.append($titleBoxDiv);
}

function addInformation ($article, place) {
  const guests = place.max_guest;
  const rooms = place.number_rooms;
  const bathrooms = place.number_bathrooms;
  const $informationDiv = $('<div>').addClass('information');
  const $maxGuestDiv = $('<div>').addClass('max_guest');
  const $numberRoomsDiv = $('<div>').addClass('number_rooms');
  const $numberBathroomsDiv = $('<div>').addClass('number_bathrooms');

  if (guests !== 1) {
    $maxGuestDiv.text('' + guests + ' Guests');
  } else {
    $maxGuestDiv.text('' + guests + ' Guest');
  }

  if (rooms !== 1) {
    $numberRoomsDiv.text('' + rooms + ' Bedrooms');
  } else {
    $numberRoomsDiv.text('' + rooms + ' Bedroom');
  }

  if (bathrooms !== 1) {
    $numberBathroomsDiv.text('' + bathrooms + ' Bathrooms');
  } else {
    $numberBathroomsDiv.text('' + bathrooms + ' Bathroom');
  }

  $informationDiv.append($maxGuestDiv);
  $informationDiv.append($numberRoomsDiv);
  $informationDiv.append($numberBathroomsDiv);
  $article.append($informationDiv);
}

function addDecription ($article, place) {
  const $descriptionDiv = $('<div>').addClass('description');

  $descriptionDiv.append(place.description);
  $article.append($descriptionDiv);
}
