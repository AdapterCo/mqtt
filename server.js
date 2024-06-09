const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// URL do broker MQTT incluindo a porta
const brokerUrl = 'mqtts://c51ea27a713c4160a7f25cca7c81e95f.s1.eu.hivemq.cloud:8883';

// Opções de conexão (exemplo com SSL/TLS)
const options = {
    username: 'esp32',  // Substitua pelo seu nome de usuário
    password: 'As123456.',    // Substitua pela sua senha
    port: 8883,
    protocol: 'mqtts',       // Use 'mqtts' para conexões seguras (SSL/TLS)
    rejectUnauthorized: false // Adicione esta linha se estiver usando um certificado autoassinado
};

// Armazenamento de mensagens recebidas
let messages = [];

// Conectar ao broker MQTT
const mqttClient = mqtt.connect(brokerUrl, options);

mqttClient.on('connect', () => {
    console.log('Conectado ao broker MQTT');
    // Subscrever ao tópico desejado
    mqttClient.subscribe('mqtt', (err) => {
        if (err) {
            console.error('Erro ao subscrever ao tópico:', err);
        } else {
            console.log('Inscrito no tópico');
        }
    });
});

mqttClient.on('message', (topic, message) => {
    console.log(`Mensagem recebida do tópico ${topic}: ${message.toString()}`);
    // Armazenar a mensagem recebida
    messages.push({ topic, message: message.toString() });
});

mqttClient.on('error', (err) => {
    console.error('Erro de conexão ao broker MQTT:', err);
});

// Endpoint para publicar mensagens MQTT
app.post('/publish', (req, res) => {
    const { topic, message } = req.body;
    mqttClient.publish(topic, message, (err) => {
        if (err) {
            return res.status(500).send(err.toString());
        }
        res.status(200).send('Mensagem publicada com sucesso');
    });
});

// Endpoint para receber mensagens MQTT
app.get('/messages', (req, res) => {
    res.status(200).json(messages);
});

// Inicie o servidor HTTP
app.listen(port, () => {
    console.log(`Servidor HTTP rodando`);
});
