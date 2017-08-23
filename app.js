var NodeGeocoder = require('node-geocoder');
var restify = require('restify');
var server = restify.createServer();
var builder = require('botbuilder');
var passingresult = "";
var assert = require("assert");
var fs = require('fs');
//Getting modules for Google Api
var PlaceSearch = require("./PlaceSearch.js");
var distance = require('google-distance');
var config = require("./config.js");
var resultsMetroName = [];
var returningResultKeyval = [];
var longitude, latitude, passingStationName = "";
var nearfromPlace = "";
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: "3dfa0867-614d-40d2-8092-08fd56df09f6",
    appPassword: "mHCEFZUbfZnFH5HLUseuJK1"
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Send welcome when conversation with bot is started, by initiating the root dialog
var bot = new builder.UniversalBot(connector);

//var recognizer = new builder.LuisRecognizer("https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/dd2533b4-f80d-4a4c-a529-c5ed09f9923c?subscription-key=038dfe1286be41f48393267d754125eb&timezoneOffset=0&verbose=true&spellCheck=true");
//bot.recognizer(recognizer);
var greeting = "Hope You are good";


bot.dialog('greeting', function (session, args) {
    session.send("Hello hope you are good ,Please start finding nearest metro by messaging me 'from PlaceName City' like  Example 'from gip noida', Example  frm akshardham delhi");
    greeting = "";
}).triggerAction({
    matches: 'greeting'
});

// // Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
bot = new builder.UniversalBot(connector, function (session) {

    //     if(args.intent.entities[args.intent.entities.length-1].type=="Places"){
    //         nearfromPlace=args.intent.entities[args.intent.entities.length-1].entity
    // }
    if (!(session.message.text.toLowerCase().includes("from") || session.message.text.toLowerCase().includes("frm"))) {

        if (!session.message.text.toLowerCase().includes("get route details")) { 
            session.send("Hello hope you are good ,Please start finding nearest metro by messaging me 'from PlaceName City' like  Example 'from gip noida', Example  frm akshardham delhi");
        }
    }

    // // Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
    if (session.message.text.includes("Get Route Details")) {

        var msg = new builder.Message(session)
            .addAttachment({
                contentUrl: 'https://scontent.fdel3-1.fna.fbcdn.net/v/t1.0-9/13256094_596395820525231_860679115565792256_n.jpg?oh=79dacaf800390a0bf58426b2af8708a6&oe=5A0EBC4C',
                // contentUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA4QAAAH0CAYAAABl8+PTAAAgAElEQVR4XuzdB5QUVdrG8WdmYGASYchDThIkqSgYwewqomtAxISKYlhcdSXImlZdEMHsp7KiKCpBDIgoomQBRTFHJOcchjQw8Tu33Z5tmp6Z7p7q7qqu/5zzHYWpuvd9f7c853v2VkgoKioqEj8IIIAAAggggAACCCCAAAKuE0ggELpuzWkYAQQQQAABBBBAAAEEEPAIEAi5EBBAAAEEEEAAAQQQQAABlwoQCF268LSNAAIIIIAAAggggAACCBAIuQYQQAABBBBAAAEEEEAAAZcKEAhduvC0jQACCCCAAAIIIIAAAggQCLkGEEAAAQQQQAABBBBAAAGXChAIXbrwtI0AAggggAACCCCAAAIIEAi5BhBAAAEEEEAAAQQQQAABlwoQCF268LSNAAIIIIAAAggggAACCBAIuQYQQAABBBBAAAEEEEAAAZcKEAhduvC0jQACCCCAAAIIIIAAAggQCLkGEEAAAQQQQAABBBBAAAGXChAIXbrwtI0AAggggAACCCCAAAIIEAi5BhBAAAEEEEAAAQQQQAABlwoQCF268LSNAAIIIIAAAggggAACCBAIuQYQQAABBBBAAAEEEEAAAZcKEAhduvC0jQACCCCAAAIIIIAAAggQCLkGEEAAAQQQQAABBBBAAAGXChAIXbrwtI0AAggggAACCCCAAAIIEAi5BhBAAAEEEEAAAQQQQAABlwoQCF268LSNAAIIIIAAAggggAACCBAIuQYQQAABBBBAAAEEEEAAAZcKEAhduvC0jQACCCCAAAIIIIAAAggQCLkGEEAAAQQQQAABBBBAAAGXChAIXbrwtI0AAggggAACCCCAAAIIEAi5BhBAAAEEEEAAAQQQQAABlwoQCF268LSNAAIIIIAAAggggAACCBAIuQYQQAABBBBAAAEEEEAAAZcKEAhduvC0jQACCCCAAAIIIIAAAggQCLkGEEAAAQQQQAABBBBAAAGXChAIXbrwtI0AAggggAACCCCAAAIIEAi5BhBAAAEEEEAAAQQQQAABlwoQCF268LSNAAIIIIAAAggggAACCBAIuQYQQAABBBBAAAEEEEAAAZcKEAhduvC0jQACCCCAAAIIIIAAAggQCLkGEEAAAQQQQAABBBBAAAGXChAIXbrwtI0AAggggAACCCCAAAIIEAi5BhBAAAEEEEAAAQQQQAABlwoQCF268LSNAAIIIIAAAggggAACCBAIuQYQQAABBBBAAAEEEEAAAZcKEAhduvC0jQACCCCAAAIIIIAAAggQCLkGEEAAAQQQQAABBBBAAAGXChAIXbrwtI0AAggggAACCCCAAAIIEAi5BhBAAAEEEEAAAQQQQAABlwoQCF268LSNAAIIIIAAAggggAACCBAIuQYQQAABBBBAAAEEEEAAAZcKEAhduvC0jQACCCCAAAIIIIAAAggQCLkGEEAAAQQQQAABBBBAAAGXChAIXbrwtI0AAggggAACCCCAAAIIEAi5BhBAAAEEEEAAAQQQQAABlwoQCF268LSNAAIIIIAAAggggAACCBAIuQYQQAABBBBAAAEEEEAAAZcKEAhduvC0jQACCCCAAAIIIIAAAggQCLkGEEAAAQQQQAABBBBAAAGXChAIXbrwtI0AAggggAACCCCAAAIIEAi5BhBAAAEEEEAAAQQQQAABlwoQCF268LSNAAIIIIAAAggggAACCBAIuQYQQAABBBBAAAEEEEAAAZcKEAhduvC0jQACCCCAAAIIIIAAAggQCLkGYi6wdOlSXXHFFfrhhx/UsWNHTZo0Sa1atfLUtXDhQp1yyimef+/fv7+eeuoppaSkhFTzI488ogceeOCIcx5++GHdf//9QY/lHWfBggVq3bq1rrrqKs+5b731lmrUqBH0OP4Hesf17z3YAY3R7Nmzi3vxrfPkk08udZgdO3Yc0Yf5u3/+85/697//7enL9Hf11VfrzTffLD422No4DgEEEEAAAQQQQMDeAgRCe6+PK6rzDYSmYRO4vEHGN8xZHQjLEzIDBalwFss7zowZMzynhxq6vIE51HBbUq1W9RWOBecggAACCCCAAAIIRF+AQBh9c2b0E/APhN5w4x+WTCC877771K9fP88I3p25skJMoB0z37G9ISwnJ0d33XWXRo8eXVyhb0AraYdwzJgxevTRR/Xll18W7256x/L9u0AL7919GzhwoD799FN17dr1iF1Qfwevj+/uqRn73HPP9Zi88MILnh1RE6zNj9lh9e3DN0Tedtttxbt+zz33nAYMGCBvOPWG89WrVx+xQ+gb1L3zendJ/esNd+eT/1AQQAABBBBAAAEEIi9AIIy8MTOUIeANhG3atPEcuWvXLk+w2b59u+dW0nPOOeewsDRq1KjiwGN2EsvaJSvpFkr/8wLdWuobZkq7ZfSTTz45LDR5ewoU8LwcvqHxtdde00svvXRYqDTH+Ycr77kmFJ5xxhnFt9OWFAi9t7Y2adKkOGiW1EewgTCQk3f31tThH6p9ayvPrbX8h4QAAggggAACCCBgvQCB0HpTRgxRwDc8HXvssZ4dLvMc4ZIlSzRy5Ej961//0oMPPli8e/btt98etutV1jNzJf2+rNDmf15pgdAbXi+99FLPs3zBPHfnP/977713xE6cdxz/XVNDbH73+++/eyx8bxkNVPe7777rMa1Zs+ZhzwyacXyfhfT/s/8zhOedd57neN+A6a3R7Eia9TOB0OwqlvfZyhAvIw5HAAEEEEAAAQQQCEOAQBgGGqdYK+AbjEygMjuC5rZNE/xMsDAB6/bbby8OhAcOHCgOJebFJ+YFKKUFkFADoTfgeLv0PtNYWiBMTU09LAiZUOsNYd4X5Pir+YfGQAG1rLAbaHfU/xzvMea2URPkfG8h9b/dtqxA2Llz5+IXAPn3470t1d8v3Gc/rb3KGA0BBBBAAAEEEEAgkACBkOsi5gK+Qcj7jGBRUZG2bNkiExB79erlCSG+t1+a0GMCl3f30LszF6iZUG8ZDRQAza2pZb1l1BuEpkyZohdffPGwXTT/ugI9r+h7TEk1+I8TTCD0hj4TBqtUqeK5/db7JlcrA6H/i218by3lOcKY/2dGAQgggAACCCCAQEABAiEXRswFfAOhd8fP+2IXs+vk3ZXyDYT+L1TxfTOpf0OBAqFvIAv0GQnvjp+pI5gdQnNrpf/LcUp7Y6h//f41e8OVN2T6P6PnfVmNuVW1rFtGzdglva011EAY6JbRsi6gYG6fLWsMfo8AAggggAACCCAQGQECYWRcGTUEgZKepfPuKpmh/HcIfV+24v+Wy5ICYaCSvEHLexuq7xs2vccHGwh9Q2ZZO2LegOYfGr0WdevW9TyDZ37MM3v+dQV606h3zrfffvuwl+6YMXzDqu+cJQVC389gmPN9v0NY2st3vM8o+tdblkcIlwuHIoAAAggggAACCFgoQCC0EJOhwhPwD4Rr1649LAD6/9n7YXpvMCnrG3zBfpjed9fOBMVbbrlFffv29dy2ap5jLOuWUdO9/46et1ZfGW8I27x5c/Gtm97f++9cmltVA31+46mnnpIZO1AIDRQIS/oMRqBPdvg+A2jCo38gNH/2N/XdoQ30ZtTSdnDDu2o4CwEEEEAAAQQQQMAKAQKhFYqMEROBsl64EouiuD0yFurMiQACCCCAAAIIIBCuAIEwXDnOi6lAWR+jj0VxwX6MPha1MScCCCCAAAIIIIAAAoEECIRcF44T8L2l0S63Ivreblray2Qch03BCCCAAAIIIIAAAnEtQCCM6+WlOQQQQAABBBBAAAEEEECgZAECIVcHAggggAACCCCAAAIIIOBSAQKhSxeethFAAAEEEEAAAQQQQAABAiHXAAIIIIAAAggggAACCCDgUgECoUsXnrYRQAABBBBAAAEEEEAAAQIh1wACCCCAAAIIIIAAAggg4FIBAqFLF562EUAAAQQQQAABBBBAAAECIdcAAggggAACCCCAAAIIIOBSAQKhSxeethFAAAEEEEAAAQQQQAABAiHXAAIIIIAAAggggAACCCDgUgECoUsXnrYRQAABBBBAAAEEEEAAAQIh1wACCCCAAAIIIIAAAggg4FIBAqFLF562EUAAAQQQQAABBBBAAAECIdcAAggggAACCCCAAAIIIOBSAQKhSxeethFAAAEEEEAAAQQQQAABAiHXAAIIIIAAAggggAACCCDgUgECoUsXnrYRQAABBBBAAAEEEEAAAQIh1wACCCCAAAIIIIAAAggg4FIBAqFLF562EUAAAQQQQAABBBBAAAECIdcAAggggAACCCCAAAIIIOBSAQKhSxeethFAAAEEEEAAAQQQQAABAiHXAAIIIIAAAggggAACCCDgUgECoUsXnrYRQAABBBBAAAEEEEAAAQIh1wACCCCAAAIIxERg74ECTftih+Z+v1tL1x3w1NCqYaq6d6qmHifWUEZqUkzqYlIEEEDATQIEQjetNr0igECJAod2HVL+/nwVHCpQYX6h57iExAQlJieqQloFVUyvqMSkROVm53r+71D2IeXuytXBnQeVuzNX1dpUU0K7Gvril2xlpFZQekqi0ionKbVyklKSE5VSKVHJFRNVqWKikhKlvIIiFRQUqbBIKiqSCguLPMdWSEpglRBwhcCSpXv1r9dXa9OO3ID91quRrAeva6LOrTJK9Hj88cc9vxs0aFDxMcuXL9f111+vO+64Q5dffnnx3y9evFgjRozQmDFjlJmZGZKxGXPgwIEaOXKkWrRoEdK5HIwAAgjYXYBAaPcV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%E2%80%A6%E2%80%A6',
                contentType: 'image/jpg',
                name: 'route.jpg'
            });
        session.send(msg);
        // session.send('If you want exact route , Please message in format "Starting place/Metro to Destination Place/Metro Name" ISBT to Akshardham');
    }

    if ((session.message.text.toLowerCase().includes("from") || session.message.text.toLowerCase().includes("frm"))) {
        //FindingPlace
        //   nearfromPlace = builder.EntityRecognizer.findEntity(args.intent.entities, 'Place');

        nearfromPlace = session.message.text.split("from")[1];

        if (nearfromPlace == "" || nearfromPlace == undefined || nearfromPlace == null) {
            nearfromPlace = session.message.text.split("From")[1];
        }

        if (nearfromPlace == "" || nearfromPlace == undefined || nearfromPlace == null) {
            nearfromPlace = session.message.text.split("frm")[1];
        }
        if (nearfromPlace == "" || nearfromPlace == undefined || nearfromPlace == null) {
            nearfromPlace = session.message.text.split("Frm")[1];
        }

        if (nearfromPlace == "" || nearfromPlace == undefined || nearfromPlace == null) {
            nearfromPlace = session.message.text;
        }

        //"2017-06-18T11:58:26+05:30"
        var messageTiming = session.message.timestamp;
        session.send("Hi " + session.message.user.name + ", " + greeting + " I am getting nearby metro station from: %s", nearfromPlace);
        var options = {
            provider: 'google',

            // Optional depending on the providers 
            // Default 
            apiKey: 'AIzaSyACurvXGgbQqG6fSe4-P1sOcEtwmyhXoTM', // for Mapquest, OpenCage, Google Premier 
            formatter: "json"         // 'gpx', 'string', ... 
        };

        var geocoder = NodeGeocoder(options);
        // Using callback 
        geocoder.geocode(nearfromPlace, function (err, res) {

            latitude = res[0].latitude;
            longitude = res[0].longitude;

            var placeSearch = new PlaceSearch(config.apiKey, config.outputFormat);
            var parameters = {
                location: [latitude, longitude],
                rankby: "distance",
                types: "subway_station"
            };

            placeSearch(parameters, function (error, response) {

                if (response.results.length > 0) {



                    resultsMetroName = [];

                    for (var i = 0; i < response.results.length; i++) {
                        resultsMetroName.push(response.results[i].name);
                    }
                    var org = [resultsMetroName[0] + "Metro", resultsMetroName[1] + "Metro", resultsMetroName[2] + "Metro"];
                    distance.get(
                        {
                            origins:
                            org,
                            destinations: [nearfromPlace]
                        },
                        function (err, data) {
                            if (err) return console.log(err);
                            returningResultKeyval = [];

                            //if(data==null){}

                            //if (resultsMetroName[0].length <= 0) {

                            //session.send("Sorry I could not find any nearest metro station from " + nearfromPlace + " I will come back to you If I find any results for you. Happy journey.");
                            //session.send("Please message me like from anyplace city. Ex From GIP Noida");
                            // }
                            //   else {


                          //  var tableHTML = '<table style="padding:10px;border:1px solid black;"><tr style="background-color:#c6c6c6"><th>Station Name</th><th>Distance</th><th></tr><tr><td>' + resultsMetroName[0] + '</td><td>' + data[0].distance + '</td></tr><tr><td>' + resultsMetroName[0] + '</td><td>' + data[0].distance + '</td></tr></table>';
                            //var message = {
                              //  type: 'message',
                                //textFormat: 'xml',
                                //text: tableHTML
                            // };

        //                    var msg = new builder.Message(session).addAttachment({
        //contentType: "application/vnd.microsoft.card.adaptive",
        //content: {
        //    type: "AdaptiveCard",
        //    speak: "<s>Your  meeting about \"Nearest Metro Stations List\"<break strength='weak'/></s><s>Do you want to get route or only distance</s>",
        //    body: [
        //         {
        //             "type": "TextBlock",
        //             "text": "Nearest Metro Stations List",
        //             "size": "large",
        //             "weight": "bolder"
        //         },
        //          {
        //              "type": "TextBlock",
        //              "text": "Nearest Metro Stations List",
        //              "size": "medium",
        //              "weight": "bolder"
        //          },
        //    ],
        //    "actions": [
        //        {
        //            "type": "Action.Http",
        //            "method": "POST",
        //            "url": "http://foo.com",
        //            "title": "Station-"+resultsMetroName[0] +" Distance-" + data[0].distance
        //        },
        //        {
        //            "type": "Action.Http",
        //            "method": "POST",
        //            "url": "http://foo.com",
        //            "title": "Station-" + resultsMetroName[1] + " Distance-" + data[1].distance
        //        },
        //        {
        //            "type": "Action.Http",
        //            "method": "POST",
        //            "url": "http://foo.com",
        //            "title": "Station-" + resultsMetroName[2] + " Distance-" + data[2].distance
        //        }
        //    ]
        //}
                           // });




                            //session.send(msg);
                            //var card = {
                                
                            //    'contentType': 'application/vnd.microsoft.card.adaptive',
                            //    'content': {
                            //        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
                            //        'type': 'AdaptiveCard',
                            //        'version': '1.0',
                            //        'body': [
                            //            {
                            //                'type': 'Container',
                            //                'speak': '<s>Nearest Metro Stations</s><s></s>',
                            //                'items': [
                            //                    {
                            //                        'type': 'ColumnSet',
                            //                        'columns': [
                            //                            {
                            //                                'type': 'Column',
                            //                                'size': 'auto',
                            //                                'items': [
                            //                                    {
                            //                                        'type': 'Image',
                            //                                        'url': 'https://placeholdit.imgix.net/~text?txtsize=65&txt=Adaptive+Cards&w=300&h=300',
                            //                                        'size': 'medium',
                            //                                        'style': 'person'
                            //                                    }
                            //                                ]
                            //                            },
                            //                            {
                            //                                'type': 'Column',
                            //                                'size': 'stretch',
                            //                                'items': [
                            //                                    {
                            //                                        'type': 'TextBlock',
                            //                                        'text': 'Hello!',
                            //                                        'weight': 'bolder',
                            //                                        'isSubtle': true
                            //                                    },
                            //                                    {
                            //                                        'type': 'TextBlock',
                            //                                        'text': 'Are you looking for a flight or a hotel?',
                            //                                        'wrap': true
                            //                                    }
                            //                                ]
                            //                            }
                            //                        ]
                            //                    }
                            //                ]
                            //            }
                            //        ],
                            //        'actions': [ /* */]
                            //    }
                            //};


                            //==========

    //                        var welcomeCard = new builder.HeroCard(session)
    //.title('Nearest Metro Station List')
    //.subtitle('Select any to get more details')
    //.images([
    //    new builder.CardImage(session)
    //        .url('https://placeholdit.imgix.net/~text?txtsize=56&txt=Contoso%20Flowers&w=640&h=330')
    //        .alt('Nearest Metro Stations')
    //])
    //.buttons([
      //builder.CardAction.imBack(session, session.gettext(resultsMetroName[0] + "Distance:" + data[0].distance),  resultsMetroName[0] + "Distance:" + data[0].distance),
       //builder.CardAction.imBack(session, session.gettext(resultsMetroName[0] + ' Distance:' + data[0].distance), resultsMetroName[0] + ' Distance:' + data[0].distance)
    //]);

    //                        session.send(new builder.Message(session).addAttachment(welcomeCard));







                            var cards = [new builder.HeroCard(session)
                                .title('Nearest Metro Station')
                                .subtitle('Station Name: ' + resultsMetroName[0] + ' Distance:' + data[0].distance)
                                .text('Results shown are shown in order of nearest station , you can click on get route to get complete Metro Route ex. Where you have to change and on which line you have to go')
                                .images([
                                    builder.CardImage.create(session, 'http://timesofindia.indiatimes.com/photo/msid-59674291/59674291.jpg')
                                ])
                                .buttons([
                                    builder.CardAction.postBack(session, "Get Route Details:" + resultsMetroName[0], "Get Route")
                                    //builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Get Route')
                                ]),

                                new builder.HeroCard(session)
                                    .title('Nearest Metro Station')
                                    .subtitle('Station Name: ' + resultsMetroName[1] + ' Distance:' + data[1].distance)
                                    .text('Results shown are shown in order of nearest station , you can click on get route to get complete Metro Route ex. Where you have to change and on which line you have to go')
                                    .images([
                                        builder.CardImage.create(session, 'http://timesofindia.indiatimes.com/photo/msid-59674291/59674291.jpg')
                                    ])
                                    .buttons([
                                        builder.CardAction.postBack(session, "Get Route Details:" + resultsMetroName[1], "Get Route")
                                        //builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Get Route')
                                    ]),
                                new builder.HeroCard(session)
                                    .title('Nearest Metro Station')
                                    .subtitle('Station Name: ' + resultsMetroName[2] + ' Distance:' + data[2].distance)
                                    .text('Results shown are shown in order of nearest station , you can click on get route to get complete Metro Route ex. Where you have to change and on which line you have to go')
                                    .images([

                                        builder.CardImage.create(session, 'http://timesofindia.indiatimes.com/photo/msid-59674291/59674291.jpg')
                                    ])
                                    .buttons([

                                        builder.CardAction.postBack(session, "Get Route Details:" + resultsMetroName[1], "Get Route")
                                        //builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Get Route')
                                    ])
                            ]
                            var reply = new builder.Message(session)
                                .attachmentLayout(builder.AttachmentLayout.carousel)
                                .attachments(cards);
                            session.send(reply);
                            // }
                        });

                    if (error) throw error;
                    assert.notEqual(response.results.length, 0, "Ranked place search must not return 0 results");
                }
                else {

                    session.send("Sorry I could not find any nearest metro station from " + nearfromPlace + " I will come back to you If I find any results for you. Happy journey.");
                    session.send("Please message me like from anyplace city. Ex From GIP Noida");
                }
            });

        });
    }
});
