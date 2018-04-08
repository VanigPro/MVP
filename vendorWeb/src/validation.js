const $ = require('jquery');

const { alertBox } = require('./confirm-dialog');

const wbValidateWithRegex = (val, regex) => {
  var returnVal = val ? regex.test(val) : true;
  return returnVal;
};

const wbIsValidEmailAddress = emailAddress => {
  //Here @ is checked for at 0 because @anytext.anytext will be passed by the pattern. So it is returned from the if loop.
  if (
    emailAddress &&
    (emailAddress.indexOf('"') !== -1 ||
      emailAddress.indexOf('“') !== -1 ||
      emailAddress.trim().indexOf('@') === 0)
  ) {
    return false;
  }
  var pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|(((\x22)(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
  //pattern to restrict “ in emails.                \u00A0-\u201B\u201D-\uD7FF
  //Below pattern allows double quotes in emails.
  //var pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
  return emailAddress ? wbValidateWithRegex(emailAddress, pattern) : false;
};

const wbIsEmailValid = emailAddress => {
  if (emailAddress) {
    if (emailAddress.length < 255) {
      return wbIsValidEmailAddress(emailAddress.trim());
    }
  }
  return false;
};

const wbInitMobileintlTelInput = $input => {
  $input.intlTelInput({
    preferredCountries: ['us'],
    allowDropdown: false,
    responsiveDropdown: true,
    nationalMode: false
  });
};

/**
 * It creates mobile number string using international telephone input library.
 *
 * @param {type} $id - id or class of the mobile input
 * @returns {String} - returns mobile number
 */
const wbGetValidMobileNumberIntInput = $id => {
  var cleanNumber = $id.intlTelInput('getNumber');
  var countryData = $id.intlTelInput('getSelectedCountryData').dialCode;
  cleanNumber = cleanNumber.slice(countryData.length + 1);
  var retMobNo = cleanNumber ? '+' + countryData + '-' + cleanNumber : '';
  return retMobNo;
};
/**
 * To validate mobile number.
 *
 * @param {type} $idorClass - id or class of the mobile input
 * @param {type} arrTypeToValidate - array of types to validate (mobile, landline)
 * @returns {Boolean}
 */
const wbMobileNumberValidate = $idorClass => {
  // Fixed line :0 , mobile : 1, fixed_line_or_mobile : 2
  var arrayNumTypes = [0, 1, 2];
  var validationError = {
    IS_POSSIBLE: 0,
    INVALID_COUNTRY_CODE: 1,
    TOO_SHORT: 2,
    TOO_LONG: 3,
    NOT_A_NUMBER: 4
  };
  var errorCode = $idorClass.intlTelInput('getValidationError');
  //var isValid = $('#regCountryCode').intlTelInput('isValidNumber');
  var numberType = $idorClass.intlTelInput('getNumberType');
  if (errorCode === validationError.IS_POSSIBLE) {
    if (arrayNumTypes.indexOf(numberType) !== -1) {
      return true;
    }
  }
  return false;
};
/**
 * This function sets mobile no into intl input inputbox
 *
 * @param {type} $element : The input element on which intl input initialized
 * @param {type} MobNumber : mobile no to be set
 * @returns {undefined}
 */
const wbSetMobileNumberIntlInput = ($element, MobNumber) => {
  $element.intlTelInput('setNumber', MobNumber);
};

const addErrorMessage = (inputName, msg) => {
  var formGroup = inputName.closest('div.form-group');
  formGroup.append("<span class='error-msg'>" + msg + '</span>');
  formGroup.addClass('error');
};

const isNegativeCheck = (fieldname, errorMsg) => {
  let fieldValue = fieldname.val();
  if (fieldValue && fieldValue <= 0) {
    addErrorMessage(fieldname, errorMsg);
    return false;
  }
  return true;
};

module.exports = {
  wbGetValidMobileNumberIntInput,
  wbInitMobileintlTelInput
};
