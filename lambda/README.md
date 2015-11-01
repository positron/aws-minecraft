# The secret for the IAM Role to turn on the server is hidden in Lambda
There is currently no way to log on to an IAM role programatically through the AWS SDK. So my options are to implement 3rd party login (e.g. with Facebook or Amazon), hard code the IAM keys in the website, or store them somewhere else behind a password.

The security requirements are not high since the amount of damage an attacker can do is limited and I will get quickly notified.

So, I hid the secret in a lambda function like this:

```javascript
exports.handler = function(event, context) {
    if (event.password == "your_password") {
        context.succeed({
            "access_key_id": "your_access_key",
            "secret_access_key": "your_secret_key"
        });
    }
    else {
        context.fail("Password is wrong");
    }
}
```

Unfortunately, setting up everything required an order of magnitude more time than writing the above code.

## Create the lambda function
Go to Lambda in the AWS Console and follow the prompts to create a node.js function. Obviously we need the bare minimum of resources (1 second timeout, smallest amount of memory available).

You can test your function by hitting the Test button and supplying custom json. The json's keys are available in `context.key_name`.

## Setting up API Gateway
The free tier allows 1M requests a month [indefinitely][free] so you won't be charged $3.50 if you stay below that limit.

[free]: https://aws.amazon.com/free/

* From Lambda, go to the API Endpoints tab
* Hit the Add API endpoint button.
* Select API Gateway as the type
* Name it something descriptive
* Set the Method to POST
* Set the Security to Open (any access keys would have to be hardcoded anyway)
* In Amazon API Gateway, select the POST method from the Resources tree
* Now we need to make the gateway pass our input parameters to the lambda function
* Click the Integration Request link
* Expand the Mapping Templates section
* Add a mapping template with "application/json" as the content type. You need to type this out even though it's the default.
* I had trouble getting this to save. I ended up hitting the edit icon by "input passthrough" then re-selecting "input passthrough" then hitting the little checkmark then hitting the big "Deploy API" button.
