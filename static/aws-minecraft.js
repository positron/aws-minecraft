// TODO: hacking together this code for now.
//       when it is all working I will make a proper state machine UI out of it using promises or some library or something



LAMBDA_URL="https://2u20yskc8i.execute-api.us-east-1.amazonaws.com/prod/fetch_minecraft_secret";

$(function() {
   START_BUTTON = $('#start-button');

   START_BUTTON.click( function() {
      // callback hell right now, will make more imperitive in the future
      var creds = getCreds();
      console.log('Got creds: ' + creds.access_key_id);
      startServer(creds);
   });

   function authError(errorMsg) {
      // TODO: display nicely somewhere
      alert(errorMsg);
      // TODO: reset state of UI to beginning where auth is required
   }

   // Save creds in HTML5 localstorage so we don't have to prompt for the password every time
   function saveCreds(data) {
      if (window.localStorage) {
         creds = {
            'access_key_id': data.access_key_id,
            'secret_access_key': data.secret_access_key
         };
         localStorage.setItem('creds', JSON.stringify(creds));
      }
      else {
         console.log('localStorage isn\'t supported. Can\'t save credentials.');
      }
   }

   // Get the IAM credentials to turn the server on. Either from localstorage
   // or by providing the right password to a lambda function.
   function getCreds() {
      START_BUTTON.html("Authenticating...");
      if (window.localStorage && localStorage.creds) {
         creds = JSON.parse(localStorage.creds);
         return creds
      } else {
         return getCredsFromLabmda();
      }
   }

   function getCredsFromLabmda() {
      var pw = window.prompt("Password");

      var post_data = { password: pw };
      $.ajax({
         url: LAMBDA_URL,
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
               var creds = {
                  'access_key_id': data.access_key_id,
                  'secret_access_key': data.secret_access_key
               };
               saveCreds(creds);
               startServer(creds);
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
   }

   function startServer(creds) {
      START_BUTTON.html("Starting server...");

      AWS.config.region = 'us-east-1';
      AWS.config.logger = console;
      AWS.config.update({accessKeyId: creds.access_key_id, secretAccessKey: creds.secret_access_key});

      var ec2 = new AWS.EC2();
      ec2.modifyInstanceAttribute(
         {
            InstanceId: 'i-82a35454',
            InstanceType: { Value: 't2.micro' }
         },
         function(err, data) {
            if (err) {
               console.log('ERROR: ' + err.code);
               console.log('ERROR: ' + err.message);
            } else {
               console.log('Instance Type changed');
               console.log(data);
               // Now start the server
               var ec2 = new AWS.EC2();
            }
         }
      );
   }
});
