const initSteps = stepNumber => {
  $('#poc-steps-container')
    .steps({
      headerTag: 'h3',
      bodyTag: 'section',
      transitionEffect: 'fade',
      // Disables the finish button (required if pagination is enabled)
      enableFinishButton: false,
      // Disables the next and previous buttons (optional)
      enablePagination: true,
      // Enables all steps from the begining
      enableAllSteps: true,
      // Removes the number from the title
      titleTemplate: '#title#',
      startIndex: stepNumber
    })
    .removeClass('hide');
};

module.exports = {
  initSteps
};
