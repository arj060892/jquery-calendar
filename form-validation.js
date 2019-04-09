var formValidation = {
  validateForm: function (formObj) {
    var errorCounter = 0;
    formObj.find("input:text").each(function () {
      //check for required
      var $control = $(this);
      var doValidation = $control.hasClasses([
        "cs-required",
        "cs-numeric",
        "cs-alphanumeric",
        "cs-alpha"
      ]);
      if (doValidation) {
        $control.on("blur", function () {
          validateInput(this)
        });

        if (validateInput(this)) {
          errorCounter++;
        };
      }
    });
    if (errorCounter > 0) {
      this.isFormValid = false;
    } else {
      this.isFormValid = true;
    }
  },
  isFormValid: false
};

// formValidation.prototype.
var validation = {
  isNotEmpty: function (str) {
    var pattern = /\S+/;
    return pattern.test(str);
  },
  isNumber: function (str) {
    var pattern = /^\d+$/;
    return pattern.test(str);
  },
  isAlphanumeric: function (str) {
    var pattern = /^[a-z0-9]+$/i;
    return pattern.test(str);
  },
  isAlpha: function (str) {
    var pattern = /^[a-zA-Z]*$/;
    return pattern.test(str);
  }
};

var errorMsgs = {
  required: "*required",
  numeric: "*the value should be a number",
  alphanumeric: "*the value should be a alphanumeric",
  alpha: "*the value should be a alphabetical"
};

function validateInput(ele) {
  var $control = $(ele);
  var isRequired, isNumeric, isAlphanumeric, isAplha, isInvalid = false;
  isRequired = $control.hasClass("cs-required");
  isNumeric = $control.hasClass("cs-numeric");
  isAlphanumeric = $control.hasClass("cs-alphanumeric");
  isAplha = $control.hasClass("cs-alpha");
  text = $control.val().trim();
  $control.siblings("span").remove();
  // required filter
  if (isRequired && !validation.isNotEmpty(text)) {
    $control.after("<span class='cs-err'>" + errorMsgs.required + "</span>");
    isInvalid = true;
  } else if (isNumeric && !validation.isNumber(text)) {
    $control.after("<span class='cs-err'>" + errorMsgs.numeric + "</span>");
    isInvalid = true;
  }
  return isInvalid;
}
