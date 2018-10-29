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
                turn = 2;
                statusDisplay.text(`Waiting on player 2...`);
                // player1NameDisplay.html(`${player1.name}`);
                // player1WinDisplay.html(`${player1.wins}`);
                // player1LossDisplay.html(`${player1.losses}`);
                //add event listen to /player1/ to update player1 DOM

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
            } else {
                console.log(`not assigning a player`);
            }

        });
    }

    player1Ref.on("value", function (snapshot) {
        console.log(`player1 value changed`)
        console.log(`${JSON.stringify(snapshot.val())}`)
        player1NameDisplay.html(`${snapshot.val().name}`);
        player1WinDisplay.html(`${snapshot.val().wins}`);
        player1LossDisplay.html(`${snapshot.val().losses}`);
    });

    player2Ref.on("value", function(snapshot){
        console.log(`player2 value changed`);
        console.log(`${JSON.stringify(snapshot.val())}`);
        player2NameDisplay.html(`${snapshot.val().name}`);
        player2WinDisplay.html(`${snapshot.val().wins}`);
        player2LossDisplay.html(`${snapshot.val().losses}`);
    })

    turnsRef.on("value", function (snapshot) {
        let playerTurn = snapshot.val();
        console.log(`turn: ${playerTurn}`);
        if (turn === 1 && (player1 && player2)) {
            //enable event listeners for player1
        } else if (turn === 2 && (player1 && player2)) {
            //enable event listeners for player2
        }
    });

    //event listener on player submit button to add player to database
    $(`#submit-player-button`).click(function (event) {
        assignPlayers();
        // //console.log(playerNameInput.val());
        // //check if name is not blank and if game is waiting for 2 assigned players
        // if (playerNameInput.val() !== "" && !(player1 && player2)) {
        //     //check if player1 null, then check player2
        //     if (player1 === null) {
        //         player1 = {
        //             name: playerNameInput.val().trim(),
        //             wins: 0,
        //             losses: 0,
        //             currentChoice: ""
        //         }
        //         console.log(`adding player1: ${JSON.stringify(player1)}`);
        //         database.ref('/players/').child('/player1').set(player1);

        //     } else if (player2 === null) {
        //         player2 = {
        //             name: playerNameInput.val().trim(),
        //             wins: 0,
        //             losses: 0, currentChoice: ""
        //         }
        //         console.log(`adding player2: ${JSON.stringify(player2)}`);
        //         database.ref('/players/').child('/player2').set(player2);

        //     }


        // } else {
        //     console.log(`name blank or all players assigned`);
        // }
    });

});