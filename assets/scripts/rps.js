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
const chatRef = database.ref(`/chat/`);

//define DOM Selectors
const submitPlayerButton = $(`#submit-player-button`);
const playerNameInput = $(`#player-name-input`);
const statusDisplay = $(`#game-status-display`);
const player1Div = $(`#player1`);
const player2Div = $(`#player2`);
const player1Choice = $(`.player1-choice`);
const player2Choice = $(`.player2-choice`);
const chatInput = $(`#chat-input`);
const submitChat = $(`#submit-chat`);
const chatBox = $(`#chat-box`);
const chatUL = $(`#chat-ul`);

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
let localID;
let p1FirebaseID;
let p2FirebaseID;


player1Choice.hide();
player2Choice.hide();

//Note: Determine why playerNameInput.val() returns undefined while inside $(document).ready(function{}), with rps.js located at top of index.html
//      
$(document).ready(function () {
    $('#start-game').modal('show');

    let assignPlayers = function () {
        connectedRef.on("value", function (snapshot) {
            if (snapshot.val()) {
                console.log(`pushing true to connections`);
                connectionsRef.push(true); //push user into connections list
                localID = connectionsRef.push().key;
                console.log(`local ID: ${localID}`);
                connectionsRef.onDisconnect().remove(); //remove user from connections list
            }
        });

        //when a new connection is added, attempt to fill player1 and player2
        connectionsRef.on("value", function (snapshot) {
            console.log(snapshot.val());
            
            activeConnections = snapshot.numChildren();
            console.log(`active connections: ${activeConnections}`);
            let playerName = playerNameInput.val().trim();

            if (activeConnections === 1) { //only 1 connection, assign player1
                //assign player1
                console.log(`running player1 assign`);
                player1 = {
                    name: playerName,
                    wins: 0,
                    losses: 0,
                    currentChoice: "",
                    id:localID
                }
                console.log(`assigning player1: ${JSON.stringify(player1)}`);
                player1Ref.set(player1);
                player1Ref.onDisconnect().remove();
                turn = { currentTurn: 2 };
                statusDisplay.text(`Waiting on player 2...`);

            } else if (activeConnections === 2) { //2 connections, assign player2
                //assign player2
                console.log(`running player2 assign`);
                player2 = {
                    name: playerName,
                    wins: 0,
                    losses: 0,
                    currentChoice: "",
                    id:localID
                }
                player2Ref.set(player2);
                player2Ref.onDisconnect().remove();
                statusDisplay.text(`Good luck!`);
                turn = { currentTurn: 1 };

            } else { //more than 2 connections, do not assign
                console.log(`not assigning a player`);
            }
            turnsRef.set(turn); //set the turn in the database
        });
    }

    //when player stats are updated, update DOM
    player1Ref.on("value", function (snapshot) {
        console.log(`player1 value changed`)
        console.log(`${JSON.stringify(snapshot.val())}`)
        if (snapshot.val()) {
            player1NameDisplay.html(`${snapshot.val().name}`);
            player1WinDisplay.html(`${snapshot.val().wins}`);
            player1LossDisplay.html(`${snapshot.val().losses}`);
        }


    });

    //when player stats are updated, update DOM
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
        //console.log(`${JSON.stringify(snapshot)}`);
        turn = snapshot.val();

        player1Ref.once('value').then(function(snapshot){
             p1FirebaseID = snapshot.val().id;
        });
        player2Ref.once('value').then(function(snapshot){
            p2FirebaseID = snapshot.val().id;
       });

        console.log(`turn: ${turn.currentTurn}`);
        if (turn.currentTurn === 1 && (player1 && player2)) {
            //enable event listeners for player1
            //toggle choices visibility
            console.log(`TOGGLE ON PLAYER1 CHOICES, MAKE VISIBLE`)
            //player1Div.toggleClass('active-player');
            player1Choice.show();
            player2Choice.hide();
            player1Choice.click(function () {
                if(localID !== p1FirebaseID){
                    return
                };
                let choice = this.dataset.choice;
                console.log(choice);
                updateChoice(choice);
                //player1Div.toggleClass('active-player');
            });
        } else if (turn.currentTurn === 2 && (player1 && player2)) {
            //enable event listeners for player2
            //console.log(`player2 choices enabled`);
            console.log(`TOGGLE ON PLAYER2 CHOICES, MAKE VISIBLE`)
            //player2Div.toggleClass('active-player');
            player2Choice.show();
            player1Choice.hide();
            player2Choice.click(function () {
                if(localID !== p2FirebaseID){
                    return
                }
                let choice = this.dataset.choice;
                console.log(choice);
                updateChoice(choice);
                //player2Div.toggleClass(`active-player`);
            })
        }
    });


    // When a value under the players reference changes, check the current choices to decide winner.
    // Check only on turn 2 to ensure both players choices are entered before checking
    playersRef.on("value", function (snapshot) {
        //add rps logic
        console.log(`****INSIDE PLAYERS REF****`);
        console.log(`playersRef values updated:`);
        console.log(JSON.stringify(snapshot.val()));

        //sync local player variables across browser tabs with database
        player1 = snapshot.val().player1;
        player2 = snapshot.val().player2;

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
            if (p1Selection === "rock") {
                if (p2Selection === "scissors") {
                    //p1 wins
                    player1Ref.update({ wins: p1Wins + 1, currentChoice: "" });
                    player2Ref.update({ losses: p2Losses + 1, currentChoice: "" });
                    console.log(`player1 wins`);
                } else if (p2Selection === "paper") {
                    //p2 wins
                    console.log(`player2 wins`);
                    player2Ref.update({ wins: p2Wins + 1, currentChoice: "" });
                    player1Ref.update({ losses: p1Losses + 1, currentChoice: "" });
                } else {
                    //tie
                    console.log(`tie`);
                }
            } else if (p1Selection === "scissors") {
                if (p2Selection === "paper") {
                    //p1 wins
                    console.log(`player1 wins`);
                    player1Ref.update({ wins: p1Wins + 1, currentChoice: "" })
                    player2Ref.update({ losses: p2Losses + 1, currentChoice: "" });
                } else if (p2Selection === "rock") {
                    //p2 wins
                    console.log(`player2 wins`);
                    player2Ref.update({ wins: p2Wins + 1, currentChoice: "" });
                    player1Ref.update({ losses: p1Losses + 1, currentChoice: "" });
                } else {
                    //tie
                    console.log(`tie`);
                }
            } else if (p1Selection === "paper") {
                if (p2Selection === "rock") {
                    //p1 wins
                    console.log(`player1 wins`);
                    player1Ref.update({ wins: p1Wins + 1, currentChoice: "" })
                    player2Ref.update({ losses: p2Losses + 1, currentChoice: "" });
                } else if (p2Selection === "scissors") {
                    //p2 wins
                    console.log(`player2 wins`);
                    player2Ref.update({ wins: p2Wins + 1, currentChoice: "" });
                    player1Ref.update({ losses: p1Losses + 1, currentChoice: "" });
                } else {
                    //tie
                    console.log(`tie`);
                }
            }
        }
    });

    chatRef.on("child_added", function (childSnapshot) {
        console.log(`****IN CHAT REF****`);
        console.log(childSnapshot.val());
        let newMessage = $(`<li>`).text(childSnapshot.val().message);
        chatUL.append(newMessage);
    });
    chatRef.onDisconnect().remove();

    //take the current turn and choice, update player choices in the database
    function updateChoice(choice) {
        if (turn.currentTurn === 1) {
            player1Choice.off('click');
            player1Ref.update({ currentChoice: choice });
            turn.currentTurn = 2;
            turnsRef.set({ currentTurn: turn.currentTurn });
            console.log(`TOGGLE PLAYER1 CHOICE OFF, MAKE INVIS`);
            
            //player1Choice.toggleClass('invisible');
            //player1Choice.hide();
        } else if (turn.currentTurn === 2) {
            player2Choice.off('click');
            player2Ref.update({ currentChoice: choice });
            turn.currentTurn = 1;
            turnsRef.set({ currentTurn: turn.currentTurn });
            console.log(`TOGGLE PLAYER2 CHOICE OFF, MAKE INVIS`);
            
            //player2Choice.toggleClass('invisible');
            //player2Choice.hide();
        }
    }

    submitChat.click(function () {
        let newMessage = chatInput.val();
        chatRef.push({ message: newMessage });
        chatInput.val("");
    })


    //event listener on player submit button in modal to add player to database and start game
    submitPlayerButton.click(function () {
        assignPlayers();
    });

});