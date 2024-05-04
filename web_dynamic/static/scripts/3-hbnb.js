// Wait for the DOM to load
$('document').ready(function () {
  // Initialize an empty list to store IDs of checked amenities
  const checkedIDs = [];

  // Select all checkbox input tags
  $('input[type="checkbox"]').on('change', function () {
    // Get the amenity ID of the checkbox
    const amenityID = $(this).data('id');
    const amenityName = $(this).data('name');

    // Check if the amenity is checked
    if ($(this).is(':checked')) {
      // Checkbox is checked. Add the ID to the list
      checkedIDs[amenityID] = amenityName;
    } else {
      // Checkbox is unchecked. Remove the ID if in the list
      delete checkedIDs[amenityID];
    }

    // Get all checked amenities in a single string
    const checkedAmenityNames = Object.values(checkedIDs).join(', ');

    // Update the h4 tag inside div amenities with the amenities checked
    $('DIV.amenities h4').text(checkedAmenityNames);
  });

  // Check API status
  $.get('http://0.0.0.0:5001/api/v1/status/', function (data) {
    if (data.status === 'OK') {
      $('div#api_status').addClass('available');
    } else {
      $('div#api_status').removeClass('available');
    }
  });

  getPlaces();
});

function getPlaces () {
  const $section = $('section.places');

  $.ajax({
    type: 'POST',
    url: 'http://0.0.0.0:5001/api/v1/places_search/',
    contentType: 'application/json',
    data: JSON.stringify({}),
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
