import mqtt from 'mqtt';


export function connectMQTT(
  url,
  options = {},
  onMessage = () => {},
  onConnect = () => {},
  onError = () => {}
) {
  // Let mqtt.js detect the protocol from the URL. Browser builds must use a ws/wss URL.
  const client = mqtt.connect(url, {
    ...options,
  });

  client.on('connect', (connack) => {
    onConnect(connack);
  });

  client.on('message', (topic, payload) => {
    onMessage(topic, payload);
  });

  client.on('error', (err) => {
    onError(err);
  });

  client.on('reconnect', () => console.debug('MQTT: reconnecting'));
  client.on('close', () => console.debug('MQTT: connection closed'));

  return client;
}
