function wlCommonInit() {


  /*
   // Custom-Authentication
  $("#LoginPage").hide();
  console.log("Dmidma was here");
  */
}

/*
   // Custom-Authentication
function getDataFromJSAdapter(){
	var invocationData = {
			adapter:"JSDataAdapter",
			procedure:"getSecretData",
			parameters:[]
	};
	
	WL.Client.invokeProcedure(invocationData).then(function(response){
		WL.Logger.debug("Received response!");
		$("#output").val(JSON.stringify(response.invocationResult));
    $('#output').format({method: 'json'});
	});
}

var challengeHandler = WL.Client.createWLChallengeHandler("CustomRealm");
challengeHandler.logger = WL.Logger.create({pkg:"challengeHandler"});

challengeHandler.handleChallenge = function(challenge){
  var authStatus = challenge.authStatus;
	this.logger.info("handleChallenge :: authStatus :: " + authStatus)
 
    if (authStatus == "credentialsRequired") {
        $("#MainPage").hide();
        $("#LoginPage").show();
        $("#username").empty();
        $("#password").empty();
        $("#done").hide();
 
        if (challenge.errorMessage){
            $("#errorMessage").html(challenge.errorMessage);
        }
    } 
}

function loginButtonClick(){
    challengeHandler.submitChallengeAnswer({
    	username: $("#username").val(),
    	password: $("#password").val()
    })
}

challengeHandler.processSuccess = function (data){
  this.logger.info("processSuccess ::", data);
  $("#LoginPage").hide();
  $("#MainPage").hide();
  $("#cliqua").click();
}

challengeHandler.handleFailure = function (data){
	this.logger.info("handleFailure ::", data);
    $("#done").hide();
    $("#LoginPage").hide();
    $("#MainPage").show();
	$("#output").val(JSON.stringify(data));
    $('#output').format({method: 'json'});
}

*/



