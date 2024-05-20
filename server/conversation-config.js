const { GuideElement, And, Or, Not, Conversation } = require("./conversation");

const conversation = new Conversation(
    [
        new GuideElement(
            new And([
                new Or([
                    "neu", "abschließen", "machen", "erstellen"
                ]),
                new Or([
                    "Vertrag", "Tarif", "Flat"
                ])
            ]),
            "Sie wollen also einen neuen Vertrag bei uns abschließen? Ist das richtig?",
            [
                new GuideElement(
                    new Or(["ja", "genau", "stimmt", "richtig"]),
                    "Das freut uns sehr. Welchen Tarif wünschen Sie sich denn? Den Super krassen, den krassen oder den mittleren",
                    [
                        new GuideElement(
                            new And(["super", "krass"]),
                            "Den super krassen also. Das kostet Sie dann 100 Euro im Monat.",
                        ),
                        new GuideElement(
                            "krass",
                            "Den krassen also. Das kostet Sie dann 70 Euro im Monat.",
                        ),
                        new GuideElement(
                            new Or(["mittel", "mittleren"]),
                            "Den mittleren also. Das kostet Sie dann 50 Euro im Monat.",
                        ),
                    ]
                ),
                new GuideElement(
                    new Or(["nein", "ne", "nö"]),
                    "Okay."
                ),
            ]
        ),
    ],
    "Willkommen beim Vertragsservice des 2 und 2. Wie kann ich Ihnen helfen?",
    "Das habe ich leider nicht verstanden. Kannst du bitte nocheinmal formulieren?",
    "Ich habe leider nichts gehört. Bitte versuche laut und deutlich zu sprechen.",
    "Auf Wiedersehen."
);

module.exports = conversation;