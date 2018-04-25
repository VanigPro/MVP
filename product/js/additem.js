// Wait for the DOM to be ready
$(function() {
  $("form[name='additem']").validate({
    rules: {
      SKU: "required",
      ItemNo: "required",
	  Description: "required",
	  Price: "required",
	  Manufacturer: "required"
    },
    messages: {
      SKU: "Please enter SKU",
      ItemNo: "Please enter Item Number",
	  Description: "Please enter Description",
	  Price: "Please enter Price",
	  Manufacturer: "Please enter Manufacturer name"
    },

    submitHandler: function(form) {
		$.ajax({
			url: '../save_item',// url where to submit the request
			type : "POST",
			dataType : 'json',
			data : $("#frmadditem").serialize(),
			success : function(result) {
				$("#frmMsg").html("Data has been saved successfully.");
				$( "#frmMsg" ).removeClass( "error").addClass("success");
				//console.log(result);
			},
			error: function(xhr, resp, text) {
				$("#frmMsg").html("There is some error while procesing your request.");
				$( "#frmMsg" ).removeClass( "success").addClass("error");
				//console.log(xhr, resp, text);
			}
		})
    }
  });
});
