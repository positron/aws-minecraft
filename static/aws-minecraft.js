// TODO: stub out UI functionality?
//window.setTimeout(func, delay);

PW_URL="https://2u20yskc8i.execute-api.us-east-1.amazonaws.com/prod/fetch_minecraft_secret";

$(function() {
   $('#start-button').click( function() {
      $(this).html("Booting...");
      pw = window.prompt("Password");
      post_data = { password: pw };
      console.log(post_data);
      iam_access_key = ""; // TODO: don't think this is a very javascript way to do this...
      iam_secret_key = "";
      $.ajax({
         url: PW_URL,
         type: "POST",
         data: JSON.stringify(post_data),
         success: function(data) {
            if (data.User) { // data returned by Amazon for some reason?
               console.log('ERROR: ' + data.User);  // TODO handle error
            }
            else if (data.errorMessage) { // thrown by lambda function (.fail returns 200 for some reason?)
               console.log('ERROR: ' + data.errorMessage);  // TODO handle error
            } else {
               console.log(data.access_key_id);
               console.log(data.secret_access_key);
            }
         },
         error: function(jqXHR, status, error) {
            // TODO handle error. General error like server is down
            console.log(status);
            console.log(error);
         }
      });
   });
});
