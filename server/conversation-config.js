const { GuideElement, And, Or, Not, Conversation } = require("./conversation");
const noEndGuideElement = new GuideElement(
    new Or(["nein", "ne", "nö"]),
    "Okay."
);
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
                noEndGuideElement,
            ]
        ),
        new GuideElement(
            new Or([
                "Vertrag", "Tarif", "Flat"
            ]),
            "Sie wollen also über einen bestehenden Vertrag bei uns reden? Ist das richtig?",
            [
                new GuideElement(
                    new Or(["ja", "genau", "stimmt", "richtig"]),
                    "Womit kann ich Ihnen denn dabei helfen? Wollen Sie einen besseren Tarif oder haben Sie Probleme mit dem Tarif den Sie zur Zeit verwenden?",
                    [
                        new GuideElement(
                            "besser",
                            "Da haben Sie leider Pech, da Sie schon den krassesten haben.",
                        ),
                        new GuideElement(
                            "Problem",
                            "Ihre Probleme sind uns aber egal.",
                        ),
                    ]
                ),
                noEndGuideElement
            ]
        )
    ],
    "Willkommen beim Vertragsservice des 2 und 2. Wie kann ich Ihnen helfen? Wollen Sie einen neuen Vertrag abschließen oder über einen bestehenden Vertrag sprechen?",
    "Das habe ich leider nicht verstanden. Kannst du bitte nocheinmal formulieren?",
    "Ich habe leider nichts gehört. Bitte versuche laut und deutlich zu sprechen.",
    "Auf Wiedersehen."
);

module.exports = conversation;