// TODO: stub out UI functionality?
//window.setTimeout(func, delay);

PW_URL="https://2u20yskc8i.execute-api.us-east-1.amazonaws.com/prod/fetch_minecraft_secret";

function authError(errorMsg) {
   // TODO: display nicely somewhere
   alert(errorMsg);
   // TODO: reset state of UI to beginning where auth is required
}

$(function() {
   $('#start-button').click( function() {
      pw = window.prompt("Password");
      $(this).html("Logging on...");

      post_data = { password: pw };
      console.log(post_data);
      iam_access_key = ""; // TODO: don't think this is a very javascript way to do this...
      iam_secret_key = "";
      $.ajax({
         url: PW_URL,
         type: "POST",
         data: JSON.stringify(post_data),
         success: function(data) {
            // AWS returns errors this way sometimes
            if (data.User) {
               console.log('ERROR: ' + data.User);
                authError('Error logging in: ' + data.User)
            }
            // lambda's .fail returns 200 for some reason (API Gateway is probably misconfigured)
            else if (data.errorMessage) {
               console.log('ERROR: ' + data.errorMessage);
               authError(data.errorMessage);
            } else if (data.access_key_id && data.secret_access_key){
               console.log(data.access_key_id);
               console.log(data.secret_access_key);
            } else {
               console.log('Returned 200 but response is malformed: ' + data);
               authError('Internal programming error');
            }
         },
         error: function(jqXHR, status, error) {
            console.log('ERROR: ' + status + ': ' + error);
            authError('Error logging in. Try again?')
         }
      });
   });
});
