import * as express from 'express';
import { Application } from 'express';
const { exec } = require('child_process');
import * as mqtt from 'async-mqtt';
import { getHours } from 'date-fns';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { catchError, filter, map, mergeMap, tap, throttleTime } from 'rxjs/operators';

const app: Application = express();
const port = 9072;

const mqttClient = mqtt.connect('http://192.168.178.28:1883');
// const mqttClient = mqtt.connect('http://broker.emqx.io'); // testing
mqttClient.subscribe('ESP_7888034/movement');
mqttClient.subscribe('alexa/speak');

function ofTopic(topicName: string) {
    return filter(([topic, message]) => topic === topicName);
}

function execCommand(device: string, command: { action: 'speak' | 'automation', param: string }): Observable<string> {
    return new Observable<string>(subscriber => {
        let commandStr = `./alexa-remote-control/alexa_remote_control.sh -d '${device}'`;
        switch (command.action) {
            case 'speak':
                commandStr += ` -e speak:'${command.param}'`;
                break;
            case 'automation':
                commandStr += ` -e automation:'${command.param}'`;
                break;
        }

        console.log(`executing command: ${commandStr}`);
        exec(commandStr, (error, stdout, stderr) => {
            if (error) {
                subscriber.error(error);
            }
            if (stderr) {
                subscriber.error(stderr.toString());
            }
            subscriber.next(stdout);
            subscriber.complete();
        });
    }).pipe(
        catchError(error => {
            console.error('exec errored with error: ', error);
            return EMPTY;
        })
    );
}

const messages$ = fromEvent(mqttClient, 'message').pipe(map(([topic, message]) => [topic, message.toString()]));

// movements
messages$.pipe(
    ofTopic('ESP_7888034/movement'),
    filter(([topic, message]) => getHours(new Date()) >= 23 || getHours(new Date()) <= 8),
    throttleTime(1000 * 60 * 5),
    mergeMap(([topic, message]) => execCommand('Philippes Echo Flex', { action: 'automation', param: 'Kleines Licht' }))
).subscribe(result => console.log(`Result: ${result}`));

// speak commands
messages$.pipe(
    ofTopic('alexa/speak'),
    mergeMap(([topic, message]) => execCommand('Philippes Echo Flex', { action: 'speak', param: message }))
).subscribe(result => console.log(`Result: ${result}`));

app.get('/speak/:speech', (req, res) => {
    mqttClient.publish('alexa/speak', req.params.speech);
});

app.get('/show-alexa-devices', (req, res) => {
    exec(`./alexa-remote-control/alexa_remote_control.sh -a`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ status: 'error', error });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ status: 'stderr', stderr });
        }
        console.log(`stdout: ${stdout}`);
        return res.status(200).json({ status: 'success', stdout });
    });
});

mqttClient.on('connect', () => {
    console.log(`connected with MQTT broker`);

    app.listen(port, () => {
        console.log(`running at http://localhost:${port}`);
    });
});
