// Use google maps api to prefill address form fields

var mapsAPILoaded = false;
function autocompleteInit(formEl) {	
	//make sure we have a key
	var key = window.SitePreferences.GOOGLE_MAPS_API_KEY;
	if (key == null || key == '') {
		return;
	}

	//prevent double API load error
	if (!mapsAPILoaded) {
		$.getScript('//maps.googleapis.com/maps/api/js?key=' + key + '&libraries=places').done(function () {
			mapsAPILoaded = true;
			autocompleteAddress(formEl);
		});
	} else {
		autocompleteAddress(formEl);
	}

	function autocompleteAddress(formEl) {
		function initAutocomplete(el) {
			autocomplete = new google.maps.places.Autocomplete(el, { types: ['address'] });
			autocomplete.setFields(['address_component']);
			autocomplete.addListener('place_changed', fillInAddress);
		}

		function fillInAddress() {
			// Get the place details from the autocomplete object.
			$sibs.removeClass('form-hidden');
			var place = autocomplete.getPlace();
			var returnedAddress = {};
			for (var i = 0; i < place.address_components.length; i++) {
				var addressType = place.address_components[i].types[0];
				if (addressType.indexOf('sublocality') > -1) {
					addressType = 'sublocality';
				}
				returnedAddress[addressType] = place.address_components[i];
			}

			// Populate form fields from address details
			var streetAddress = returnedAddress.street_number ? (returnedAddress.street_number.short_name + ' ') : '';
			streetAddress = streetAddress + (returnedAddress.route ? returnedAddress.route.long_name : '');
			$streetAddress.val(streetAddress).trigger('change');
			var city = returnedAddress.locality ? returnedAddress.locality.long_name : '';
			if (city == '') {
				city = returnedAddress.sublocality ? returnedAddress.sublocality.long_name : '';
			}
			$city.val(city).trigger('change');
			$state.val(returnedAddress.administrative_area_level_1 ? returnedAddress.administrative_area_level_1.short_name : '').trigger('change');
			$zip.val(returnedAddress.postal_code ? returnedAddress.postal_code.short_name : '').trigger('change');
			$zip.closest('.form-row').next('.form-row').find('input').focus();
		}

		// Get address1 field to trigger the Autocomplete
		var input = formEl[0].querySelector('[id$="_address1"]');
		if (input == null) {
			return;
		}
		var autocomplete,
			$autocompleteForm = formEl,
			$streetAddress = $autocompleteForm.find($('input[id$="_address1"]')),
			$city = $autocompleteForm.find($('input[id$="_city"]')),
			$state = $autocompleteForm.find($('select[id$="_state"]')),
			$zip = $autocompleteForm.find($('input[id$="_postal"]')),
			$sibs = $streetAddress.closest('.form-row').nextAll('.form-row');

		//Hide the address fields beyond address1 if they are empty
		if ($streetAddress.val() == '') {
            $sibs.addClass('form-hidden');
		}
		 
		//Triggers an instance of Autocomplete
		initAutocomplete(input);

		//Prevents browser suggestions from obscuring autocomplete dropdown
		$streetAddress.on('focus', function () {
			$(this).attr('autocomplete', 'new-password');
		});
		$streetAddress.attr('placeholder', '');
		
		//Show subsequent fields when leaving address1 field
		$streetAddress.on('change blur', function () {
			$sibs.removeClass('form-hidden');
		});

	}

}

/**
 * @function
 * @description handle each address form
 */
exports.init = function () {
    $('.address').each(function () {
        var $form = $(this);

        //if google autocomplete is enabled, init 
        if (window.SitePreferences.GOOGLE_AUTOCOMPLETE_ENABLED) {
            autocompleteInit($form);
        }
    }
}
