const express = require('express');
const { CustomCall } = require("./call")
const { CommunicationIdentityClient } = require('@azure/communication-identity');

const conversation = require("./conversation-config");

class ChatBot {
    constructor() {
        this._port = process.env.PORT | 3000;
        this._app = express();

        this._calls = {};

        this._app.use(express.json());

        this._app.post('/api/events/:communicationUserId', (req, res) => this._handleEventsController(req, res));
        this._app.post('/api/user', async (req, res) => await this._createUserController(req, res));
        this._app.post('/api/call/:communicationUserId', async (req, res) => await this._createCallController(req, res));


        this._identityClient = new CommunicationIdentityClient(process.env.RESOURCE_CONNECTION_STRING);
    }

    _handleEventsController(req, res) {
        
        const communicationUserId = req.params.communicationUserId;
        let call = this._calls[communicationUserId];
        if (call) {
            const callConversation = call.conversation;
            console.log(callConversation);
            for (let event of req.body) {
                if (event.type == "Microsoft.Communication.CallConnected") {
                    call.startRecognizing(callConversation.initalPhrase);
                } else if (event.type == "Microsoft.Communication.RecognizeCompleted") {
                    let speechText = event.data.speechResult.speech;
                    let anwser = callConversation.anwser(speechText);
                    if (callConversation.ended) {
                        call.playText(anwser);
                    } else {
                        call.startRecognizing(anwser);
                    }
                } else if (event.type == "Microsoft.Communication.RecognizeFailed") {
                    call.startRecognizing(callConversation.notRecognizablePhrase);
                } else if (event.type == "Microsoft.Communication.PlayCompleted") {
                    if (callConversation.ended) {
                        call.endCall();
                        this._deleteUser(communicationUserId);
                    }
                } else if (event.type == "Microsoft.Communication.CallDisconnected") {
                    this._deleteUser(communicationUserId);
                }
            }
        }
        res.send();
    }

    async _createUserController(req, res) {
        const { token, expiresOn, user } = await this._identityClient.createUserAndToken(["voip"]);;
        res.json({
            token: token,
            id: user.communicationUserId
        });
    }

    async start() {
        return new Promise((resolve, reject) => {
            try {
                this._app.listen(this._port, () => {
                    console.log("Webserver started!\n");
                    resolve();
                });
            } catch (e) {
                reject(e);
            }

        });
    }

    async _createCallController(req, res) {
        const communicationUserId = req.params.communicationUserId;
        if (communicationUserId) {
            await this._createCall(communicationUserId);
        }

        res.send();
    }

    async _createCall(communicationUserId) {
        let callbackUri = process.env.CALLBACK_URI;
        if (callbackUri.charAt(callbackUri.length - 1) == "/") {
            callbackUri += communicationUserId;
        } else {
            callbackUri += `/${communicationUserId}`
        }
        const cognitiveServicesEndpoint = process.env.COGNITIVE_SERVICE_ENDPOINT;
        const call = new CustomCall(conversation.clone(), communicationUserId, callbackUri, cognitiveServicesEndpoint);
        this._calls[communicationUserId] = call;
        await call.startCall();
    }

    _deleteUser(communicationUserId){
        delete this._calls[communicationUserId];
        this._identityClient.deleteUser({
            communicationUserId: communicationUserId
        });
    }
}

module.exports = new ChatBot();