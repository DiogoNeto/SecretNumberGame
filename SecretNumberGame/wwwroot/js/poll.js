"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/pollHub").build();
var chartBlock = '\u25A3';
var secret = -1;
var secretGenerated = false;
var interaction = 0;

window.onload = (event) => {
    document.getElementById('userInputDiv').style.visibility = 'hidden';
    document.getElementById('divBet').style.visibility = 'hidden';
};

connection.on("ReceiveMessage", function (user, message, myChannelId, myChannelVal) {
    secret = message;
    console.log("message: " + secret.toString());

    if ($('input[id=bet]').val() != secret) {
        document.getElementById('min').style.visibility = 'hidden';
        document.getElementById('max').style.visibility = 'hidden';
        document.getElementById('divSelect').style.visibility = 'hidden';
        document.getElementById('userInputDiv').style.visibility = 'visible';
        document.getElementById('divBet').style.visibility = 'visible';
    }
    
    if (interaction > 0) {
        if (myChannelVal < secret) {
            var pollResultMsg = user + " - " + myChannelVal + " - LO: the mystery number is < the player's guess.";
        }
        if (myChannelVal > secret) {
            var pollResultMsg = user + " - " + myChannelVal + " - HI: the mystery number is > the player's guess.";
        }
        if (myChannelVal == secret) {
            var pollResultMsg = user + " - " + myChannelVal + " - !!!!!!!Congratulations you won the game!!!!!!";
        }

        var ulPoll = document.getElementById("messagesList");
        var liPollResult = document.createElement("li");
        liPollResult.textContent = pollResultMsg;

        ulPoll.insertBefore(liPollResult, ulPoll.childNodes[0]);
        document.getElementById(myChannelId + 'Block').innerHTML += chartBlock;
    }
    interaction++;
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;

    if (secret < 0) {
        if (secretGenerated == false) {
            secret = Math.floor((Math.random() * $('input[id=maxSecret]').val()) + $('input[id=minSecret]').val());
            document.getElementById('min').style.visibility = 'hidden';
            document.getElementById('max').style.visibility = 'hidden';
            document.getElementById('divSelect').style.visibility = 'hidden';

            document.getElementById('userInputDiv').style.visibility = 'visible';
            document.getElementById('divBet').style.visibility = 'visible';
            secretGenerated = true;
        }

        myChannelVal = 'Secret Generated';
        connection.invoke("SendMessage", user, secret.toString(), myChannelId, myChannelVal).catch(function (err) {
            return console.error(err.toString());
        });
    }
    else {
        if (!user) {
            user = "[Anonymous]";
        }

        if ($('input[id=bet]').val() == secret) {
            alert("Congratulations!");

            document.getElementById('userInputDiv').style.visibility = 'hidden';
            document.getElementById('divBet').style.visibility = 'hidden';
            document.getElementById('sendButton').style.visibility = 'hidden';
        }

        if ($('input[id=bet]').val() > 0) {
            var myChannelId = $('input[name=myChannel]:checked').attr('id');

            var myChannelVal = $('input[id=bet]').val();
            connection.invoke("SendMessage", user, secret, myChannelId, myChannelVal).catch(function (err) {
                return console.error(err.toString());
            });
        } else {
            alert("Select a number greater than zero!");
            return console.log("Select a number greater than zero!");
        }
    }
    event.preventDefault();
});
