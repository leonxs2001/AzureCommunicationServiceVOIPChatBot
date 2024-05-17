const express = require('express');
const { CustomCall } = require("./call")

const conversation = require("./conversation-config");

class ChatBot {
    constructor() {
        this._port = process.env.PORT | 3000;
        this._app = express();

        this._calls = {};

        this._app.use(express.json());

        this._app.post('/events/:communicationUserId', (req, res) => this._handleEvents(req, res));
    }

    _handleEvents(req, res) {

        const communicationUserId = req.params.communicationUserId;
        let call = this._calls[communicationUserId];
        if (call) {
            for (let event of req.body) {
                if (event.type == "Microsoft.Communication.CallConnected") {
                    console.log(`ChatBot: ${conversation.initalPhrase}`);
                    call.startRecognizing(conversation.initalPhrase);
                } else if (event.type == "Microsoft.Communication.RecognizeCompleted") {
                    let speechText = event.data.speechResult.speech;
                    console.log(`Du: ${speechText}`);
                    let anwser = conversation.anwser(speechText);
                    console.log(`ChatBot: ${anwser}`);
                    if (conversation.ended) {
                        call.playText(anwser);
                    } else {
                        call.startRecognizing(anwser);
                    }
                } else if (event.type == "Microsoft.Communication.RecognizeFailed") {
                    console.log(`ChatBot: ${conversation.notRecognizablePhrase}`);
                    call.startRecognizing(conversation.notRecognizablePhrase);
                } else if (event.type == "Microsoft.Communication.PlayCompleted") {
                    if (conversation.ended) {
                        call.endCall(true);
                        delete this._calls[communicationUserId];
                    }
                }else if (event.type == "Microsoft.Communication.CallDisconnected"){
                    delete this._calls[communicationUserId];
                }
            }
        }
        res.send();
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

    async createCall() {
        const userId = process.env.USER_ID;
        let callbackUri = process.env.CALLBACK_URI;
        if (callbackUri.charAt(callbackUri.length - 1) == "/") {
            callbackUri += userId;
        } else {
            callbackUri += `/${userId}`
        }
        const cognitiveServicesEndpoint = process.env.COGNITIVE_SERVICE_ENDPOINT;

        const call = new CustomCall(userId, callbackUri, cognitiveServicesEndpoint);
        this._calls[userId] = call;
        call.startCall();
    }
}

module.exports = new ChatBot();