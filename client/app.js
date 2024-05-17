import { CallClient } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const userToken = document.getElementById("token-input");
const submitToken = document.getElementById("token-submit");

const calleeInput = document.getElementById("callee-id-input");

const hangUpButton = document.getElementById("hang-up-button");

let call;
let callAgent;
let tokenCredential;

submitToken.addEventListener("click", async () => {
    const callClient = new CallClient();
    const userTokenCredential = userToken.value;
    try {
        tokenCredential = new AzureCommunicationTokenCredential(userTokenCredential);
        callAgent = await callClient.createCallAgent(tokenCredential);
        callAgent.on('incomingCall', incomingCallHandler)
        submitToken.disabled = true;
        userToken.disabled = true;
    } catch (error) {
        window.alert("Please submit a valid token!");
    }
});

hangUpButton.addEventListener("click", () => {
    console.log(call);
    // end the current call
    call.hangUp({ forEveryone: true });
    // toggle button states
    hangUpButton.disabled = true;
    calleeInput.disabled = false;
});

const incomingCallHandler = async (args) => {
    let incomingCall = args.incomingCall;

    if (true/*confirm("Du bekommst einen Anruf. Willst du diesen annehmen?)"*/) {
        call = await incomingCall.accept();
        hangUpButton.disabled = false;

        // Subscribe to callEnded event and get the call end reason
        call.on('stateChanged', () => {
            if (call.state == "Disconnected") {
                alert("Der Anruf wurde beenden.");
                console.log(args.callEndReason);
                hangUpButton.disabled = true;
            }
        });
    } else {
        await incomingCall.reject();
    }
};

async function test(audioStream){
    while(audioStream.length <= 0){}
    console.log()
}