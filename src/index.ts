import * as express from 'express';
import { Application, Request, Response } from 'express';
const { exec } = require('child_process');

const app: Application = express();
const port = 9072;

app.get('/speak/:speech', (req, res) => {
    const speech = req.params.speech;
    console.log(speech);
    exec(`./alexa-remote-control/alexa_remote_control.sh -d 'Philippes Echo Flex' -e speak:'${speech}'`, (error, stdout, stderr) => {
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

app.get('/automation/:routineName', (req, res) => {
    const routineName = req.params.routineName; // e.g. Kleines Licht
    console.log(routineName);
    exec(`./alexa-remote-control/alexa_remote_control.sh -d 'Philippes Echo Flex' -e automation:'${routineName}'`, (error, stdout, stderr) => {
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

app.listen(port, () => {
    console.log(`running at http://localhost:${port}`);
});
