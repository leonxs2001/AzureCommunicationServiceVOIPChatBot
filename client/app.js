import { CallClient, LocalAudioStream } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const createCall = document.getElementById("create-call");

const hangUpButton = document.getElementById("hang-up-button");

const loader = document.getElementById("loader");

document.addEventListener('DOMContentLoaded', () => {

    loader.style.display = "none";
    createCall.disabled = false;
});

let call;
let callAgent;
let tokenCredential;
const URI = "https://cloud.tarra-schoenberg.de/api/";

createCall.addEventListener("click", async () => {
    loader.style.display = "inline-block";
    createCall.disabled = true;
    try {

        let response = await fetch(`${URI}user`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const communicationUserId = data.id;

        const callClient = new CallClient();
        const userTokenCredential = data.token;
        tokenCredential = new AzureCommunicationTokenCredential(userTokenCredential);
        callAgent = await callClient.createCallAgent(tokenCredential);
        callAgent.on('incomingCall', incomingCallHandler);
        callAgent.on("connectionStateChanged", async event => {
            if (event.newValue == "Connected") {
                const response = await fetch(`${URI}call/${communicationUserId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            }
        });
    } catch (e) {
        console.error(e);
        loader.style.display = "none";
        createCall.disabled = false;
    }
    
});

hangUpButton.addEventListener("click", () => {

    call.hangUp({ forEveryone: true });
    
    hangUpButton.disabled = true;
    createCall.disabled = false;
});

const incomingCallHandler = async (args) => {
    loader.style.display = "none";
    let incomingCall = args.incomingCall;

    call = await incomingCall.accept();
    hangUpButton.disabled = false;

    // Subscribe to callEnded event and get the call end reason
    call.on('stateChanged', () => {
        console.log("New State: ", call.state);
        if (call.state == "Disconnected") {
            alert("Der Anruf wurde beenden.");
            console.log(args.callEndReason);
            hangUpButton.disabled = true;
            createCall.disabled = false;
        }
    });
};