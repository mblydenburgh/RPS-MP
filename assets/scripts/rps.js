const config = {
    apiKey: "AIzaSyBJigd9ReUwomdk4C5unw9gPiS8CYT5V44",
    authDomain: "rps-mp-d43ec.firebaseapp.com",
    databaseURL: "https://rps-mp-d43ec.firebaseio.com",
    projectId: "rps-mp-d43ec",
    storageBucket: "rps-mp-d43ec.appspot.com",
    messagingSenderId: "499162764941"
};
firebase.initializeApp(config);
database = firebase.database();

//define firebase references
const playersRef = database.ref('/players/');
const player1Ref = playersRef.child('/player1');
const player2Ref = playersRef.child('/player2');
const connectedRef = database.ref('.info/connected'); //firebase's connections reference uses boolean to track connections
const connectionsRef = database.ref(`/connections/`); //custom list of connections
const turnsRef = database.ref(`/turns/`); //turns reference to manage click events for choice buttons

//define DOM Selectors
const playerNameInput = $(`#player-name-input`);
const statusDisplay = $(`#game-status-display`);
const rpsOption = $(`.choice`);

const player1NameDisplay = $(`#player1-name-display`);
const player1WinDisplay = $(`#player1-win-display`);
const player1LossDisplay = $(`#player1-loss-display`);

const player2NameDisplay = $(`#player2-name-display`);
const player2WinDisplay = $(`#player2-win-display`);
const player2LossDisplay = $(`#player2-loss-display`);

//initialize player objects as null (not assigned yet)
let player1 = null;
let player2 = null;
let activeConnections;
let turn = null;




//Note: Determine why playerNameInput.val() returns undefined while inside $(document).ready(function{}), with rps.js located at top of index.html
//      Determine whplayer2 gets same name value as player1
$(document).ready(function () {
    $('#start-game').modal('show');

    let assignPlayers = function () {
        connectedRef.on("value", function (snapshot) {
            if (snapshot.val()) {
                console.log(`pushing true to connections`)
                connectionsRef.push(true); //push user into connections list
                connectionsRef.onDisconnect().remove(); //remove user from connections list
            }
        });
        connectionsRef.on("value", function (snapshot) {
            activeConnections = snapshot.numChildren();
            console.log(`active connections: ${activeConnections}`);
            let playerName = playerNameInput.val().trim();

            if (activeConnections === 1) {
                //assign player1
                console.log(`running player1 assign`);
                player1 = {
                    name: playerName,
                    wins: 0,
                    losses: 0,
                    currentChoice: ""
                }
                console.log(`assigning player1: ${JSON.stringify(player1)}`);
                player1Ref.set(player1);
                player1Ref.onDisconnect().remove();
                turn = { currentTurn: 2 };
                statusDisplay.text(`Waiting on player 2...`);

            } else if (activeConnections === 2) {
                //assign player2
                console.log(`running player2 assign`);
                player2 = {
                    name: playerName,
                    wins: 0,
                    losses: 0,
                    currentChoice: ""
                }
                player2Ref.set(player2);
                player2Ref.onDisconnect().remove();
                statusDisplay.text(`Good luck!`);
                turn = { currentTurn: 1 };
            } else {
                console.log(`not assigning a player`);
            }
            turnsRef.update(turn);
        });
    }

    player1Ref.on("value", function (snapshot) {
        console.log(`player1 value changed`)
        console.log(`${JSON.stringify(snapshot.val())}`)
        if (snapshot.val()) {
            player1NameDisplay.html(`${snapshot.val().name}`);
            player1WinDisplay.html(`${snapshot.val().wins}`);
            player1LossDisplay.html(`${snapshot.val().losses}`);
        }


    });

    player2Ref.on("value", function (snapshot) {
        console.log(`player2 value changed`);
        console.log(`${JSON.stringify(snapshot.val())}`);
        if (snapshot.val()) {
            player2NameDisplay.html(`${snapshot.val().name}`);
            player2WinDisplay.html(`${snapshot.val().wins}`);
            player2LossDisplay.html(`${snapshot.val().losses}`);
        }


    });

    turnsRef.on("value", function (snapshot) {
        let playerTurn = snapshot.val().currentTurn;
        console.log(`turn: ${playerTurn}`);
        if (playerTurn === 1 && (player1 && player2)) {
            //enable event listeners for player1
            console.log(`player1 turn`);
            rpsOption.click(function() {
                //let choice = JSON.stringify(event);
                let choice = this.dataset.choice;
                console.log(choice);
                player1Ref.update({currentChoice:choice});
                turnsRef.update({currentTurn:2});

            })
        } else if (playerTurn === 2 && (player1 && player2)) {
            //enable event listeners for player2
            console.log(`player2 turn`);
            rpsOption.click(function(){
                let choice = this.dataset.choice;
                console.log(choice);
                player2Ref.update({currentChoice:choice});
            })
        }
    });


    playersRef.on("value", function (snapshot) {
        //add rps logic
    })

    //event listener on player submit button to add player to database
    $(`#submit-player-button`).click(function (event) {
        assignPlayers();
    });

});