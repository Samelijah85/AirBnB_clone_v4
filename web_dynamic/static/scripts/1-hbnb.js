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
});
