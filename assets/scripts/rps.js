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
const player1Ref = playersRef.child('player1');
const player2Ref = playersRef.child('player2');
const connectedRef = database.ref('.info/connected'); //firebase's connections reference uses boolean to track connections
const connectionsRef = database.ref(`/connections/`); //custom list of connections
const turnsRef = database.ref(`/turns/`); //turns reference to manage click events for choice buttons

//define DOM Selectors
const playerNameInput = $(`#player-name-input`);

//initialize player objects as null (not assigned yet)
let player1 = null;
let player2 = null;

let localPlayerName;




//Note: Determine why playerNameInput.val() returns undefined while inside $(document).ready(function{}), with rps.js located at top of index.html
$(document).ready(function () {
    $('#start-game').modal('show');

    let assignPlayers = function(){
        connectedRef.on("value", function (snapshot) {
            if (snapshot.val()) {
                console.log(`pushing true to connections`)
                connectionsRef.push(true); //push user into connections list
                connectionsRef.onDisconnect().remove(); //remove user from connections list
            }
        });
    
        connectionsRef.on("value",function(snapshot){
            console.log(`there are currently ${snapshot.numChildren()} connections`);
        });
    }
    

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

    turnsRef.on("value",function(snapshot){
        let playerTurn = snapshot.val();
        console.log(`turn: ${playerTurn}`);
    })


});