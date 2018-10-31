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
const player1Choice = $(`.player1-choice`);
const player2Choice = $(`.player2-choice`);

const player1NameDisplay = $(`#player1-name-display`);
const player1WinDisplay = $(`#player1-win-display`);
const player1LossDisplay = $(`#player1-loss-display`);

const player2NameDisplay = $(`#player2-name-display`);
const player2WinDisplay = $(`#player2-win-display`);
const player2LossDisplay = $(`#player2-loss-display`);

//initialize player objects as null (not assigned yet)
let player1 = null;
let p1Selection;
let player2 = null;
let p2Selection;
let activeConnections;
let turn = null;




//Note: Determine why playerNameInput.val() returns undefined while inside $(document).ready(function{}), with rps.js located at top of index.html
//      
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
            turnsRef.set(turn);
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

    // when the value of turn changes in the database, enable each player's listeners
    turnsRef.on("value", function (snapshot) {
        console.log(`****INSIDE TURN REF****`);
        console.log(`${JSON.stringify(snapshot)}`);
        turn = snapshot.val();
        console.log(`turn: ${turn.currentTurn}`);
        if (turn.currentTurn === 1 && (player1 && player2)) {
            //enable event listeners for player1
            console.log(`player1 choices enabled`);
            player1Choice.click(function () {
                let choice = this.dataset.choice;
                console.log(choice);
                updateChoice(choice);

            })
        } else if (turn.currentTurn === 2 && (player1 && player2)) {
            //enable event listeners for player2
            console.log(`player2 choices enabled`);
            player2Choice.click(function () {
                let choice = this.dataset.choice;
                console.log(choice);
                updateChoice(choice);

            })
        }
    });


    // When a value under the players reference changes, check the current choices to decide winner.
    // Check only on turn 2 to ensure both players choices are entered before checking
    playersRef.on("value", function (snapshot) {
        //add rps logic
        console.log(`****INSIDE PLAYERS REF****`);
        console.log(`playersRef values updated:`);
        console.table(JSON.stringify(snapshot.val()));
        
        // If player1 null, add from database.
        if(!player1){
            console.log(`player1 doesnt exist, assigning`);
            player1 = snapshot.val().player1;
        }

        //defining variables for player choices, wins and losses for updating
        p1Selection = snapshot.val().player1.currentChoice;
        p2Selection = snapshot.val().player2.currentChoice;
        p1Wins = snapshot.val().player1.wins;
        p1Losses = snapshot.val().player1.losses;
        p2Wins = snapshot.val().player2.wins;
        p2Losses = snapshot.val().player2.losses;

        console.log(`p1Selection: ${p1Selection}`);
        console.log(`p2Selection: ${p2Selection}`);

        if (turn.currentTurn === 1 && (player1 && player2)) {
            console.log(`turn 1, not checking choices`)
        } else if (turn.currentTurn === 2 && (player1 && player2)) {
            console.log(`turn 2, compare logic executing`);
            if(p1Selection === "rock"){
                if(p2Selection === "scissors"){
                    //p1 wins
                    player1Ref.update({wins:p1Wins+1,currentChoice:""})
                    player2Ref.update({losses:p2Losses+1,currentChoice:""});
                    console.log(`player1 wins`);
                } else if (p2Selection === "paper"){
                    //p2 wins
                    console.log(`player2 wins`);
                    player2Ref.update({wins:p2Wins+1,currentChoice:""});
                    player1Ref.update({losses:p1Losses+1,currentChoice:""});
                } else{
                    //tie
                    console.log(`tie`);
                }
            } else if (p1Selection === "scissors"){
                if(p2Selection === "paper"){
                    //p1 wins
                    console.log(`player1 wins`);
                    player1Ref.update({wins:p1Wins+1,currentChoice:""})
                    player2Ref.update({losses:p2Losses+1,currentChoice:""});
                } else if(p2Selection === "rock"){
                    //p2 wins
                    console.log(`player2 wins`);
                    player2Ref.update({wins:p2Wins+1,currentChoice:""});
                    player1Ref.update({losses:p1Losses+1,currentChoice:""});
                } else{
                    //tie
                    console.log(`tie`);
                }
            } else if(p1Selection === "paper"){
                if(p2Selection === "rock"){
                    //p1 wins
                    console.log(`player1 wins`);
                    player1Ref.update({wins:p1Wins+1,currentChoice:""})
                    player2Ref.update({losses:p2Losses+1,currentChoice:""});
                } else if (p2Selection === "scissors"){
                    //p2 wins
                    console.log(`player2 wins`);
                    player2Ref.update({wins:p2Wins+1,currentChoice:""});
                    player1Ref.update({losses:p1Losses+1,currentChoice:""});
                } else{
                    //tie
                    console.log(`tie`);
                }
            }
        }
    });

    //take the current turn and choice, update player choices in the database
    function updateChoice(choice) {
        if (turn.currentTurn === 1) {
            player1Ref.update({ currentChoice: choice });
            turn.currentTurn = 2;
            turnsRef.set({ currentTurn: turn.currentTurn });
            player1Choice.off('click');
        } else if (turn.currentTurn === 2) {
            player2Ref.update({ currentChoice: choice });
            turn.currentTurn = 1;
            turnsRef.set({ currentTurn: turn.currentTurn });
            player2Choice.off('click');
        }
    }


    //event listener on player submit button in modal to add player to database and start game
    $(`#submit-player-button`).click(function () {
        assignPlayers();
    });

});