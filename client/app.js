import { CallClient, LocalAudioStream } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const createCall = document.getElementById("create-call");

//const audioInputSelect = document.getElementById("audio-input-select");

const hangUpButton = document.getElementById("hang-up-button");

const loader = document.getElementById("loader");

document.addEventListener('DOMContentLoaded', () => {

    /*navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            audioInputs.forEach(device => {
                console.log(device);
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || 'Unbekanntes Gerät';
                audioInputSelect.appendChild(option);
            });
            createCall.disabled = false;
            audioInputSelect.disabled = false;
        });*/
    loader.style.display = "none";
    createCall.disabled = false;
    //audioInputSelect.disabled = false;
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
            method: 'POST', // Verwendung der POST-Methode
            headers: {
                'Content-Type': 'application/json', // Setzen des Content-Type-Headers auf JSON
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
    // end the current call
    call.hangUp({ forEveryone: true });
    // toggle button states
    hangUpButton.disabled = true;
    createCall.disabled = false;
    //audioInputSelect.disabled = false;
});

const incomingCallHandler = async (args) => {
    loader.style.display = "none";
    //audioInputSelect.disabled = true;
    let incomingCall = args.incomingCall;

    /*const constraints = {
        audio: true
    };

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

    const acceptCallOptions = {
        audioOptions: {
            localAudioStreams: [new LocalAudioStream(mediaStream)]
        }
    }*/

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
            //audioInputSelect.disabled = false;
        }
    });
};