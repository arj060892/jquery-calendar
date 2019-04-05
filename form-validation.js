function formValidation(formObj) {
    this.$formObj = formObj;
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
    }
  };
  
  
  $('#marker-edit-location-content').find('input:text').each(function () {
    //check for required
    var $control = $(this);
    var doValidation = $control.hasClasses(['cs-required', 'cs-numeric', 'cs-alphanumeric', 'cs-alpha']);
    if (doValidation) {
      $control.on('blur', function () {
        var isRequired, isNumeric, isAlphanumeric, isAplha;
        isRequired = $control.hasClass('cs-required');
        isNumeric = $control.hasClass('cs-numeric');
        isAlphanumeric = $control.hasClass('cs-alphanumeric');
        isAplha = $control.hasClass('cs-alpha');
  
        // required filter
        if (isRequired) {
  
        }
      })
      var elVal = $control.val().trim();
      $control.after();
    }
  
  
  });
  