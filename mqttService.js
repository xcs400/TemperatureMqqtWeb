
export class MQTTService {
  constructor(host, messageCallbacks) {
    this.mqttClient = null;
    this.host = host;
    this.messageCallbacks = messageCallbacks;
    this.initialOptions = null;
  }

  connect(options) {
    return new Promise((resolve, reject) => {
      this.initialOptions = options; // Store initial connection options

      this.mqttClient = mqtt.connect(this.host, options);

      this.mqttClient.on('error', (err) => {
        console.log(err);
        this.mqttClient.end();
        reject(err);
      });

      this.mqttClient.on('connect', () => {
        console.log(`MQTT client connected`);
		 this.handleCallback('onConnect');
        resolve(); // Resolve the promise once connected
      });

      this.mqttClient.on('message', (topic, message) => {
        this.handleMessageCallback(topic, message);
      });

      this.mqttClient.on('close', () => {
        console.log(`MQTT client disconnected`);
        this.handleCallback('onClose');
      });
    });
  }

  disconnect() {
	return new Promise((resolve, reject) => {
		  
    if (this.mqttClient) {
      this.mqttClient.end();
	  this.mqttClient.on('close', () => {
        console.log(`MQTT client disconnected`);
			resolve();
		
				})
			}
	  })
  }

  copyAllMessages(sourceTopic, destinationTopic) {
    if (this.mqttClient) {
      this.subscribe(sourceTopic);

      this.mqttClient.on('message', (topic, message) => {
        var stringResponse = message.toString();
        stringResponse = stringResponse.replace('id:', '"id":');

        console.log('message copy', topic, stringResponse);
        this.publish(destinationTopic, stringResponse);
      });
    }
  }

  publish(topic, message, options) {
    // Check if the client is connected
    if (this.mqttClient && this.mqttClient.connected) {
      // If connected, publish the message
      this.mqttClient.publish(topic, message, options);
    } else {
      // If not connected, reconnect with initial options and then publish
      this.connect(this.initialOptions)
        .then(() => {
          this.mqttClient.publish(topic, message, options);
        })
        .catch((err) => {
          console.error('Error reconnecting:', err);
          // Handle the error accordingly, e.g., notify the user or log it
        });
    }
  }

  subscribe(topic, options) {
if (this.mqttClient && this.mqttClient.connected) 
    this.mqttClient.subscribe(topic, options);
else
		{
			 this.connect(this.initialOptions)
				.then(() => {
				   this.mqttClient.subscribe(topic, options);
				})	
			     .catch((err) => {
          console.error('Error reconnecting:', err);
          // Handle the error accordingly, e.g., notify the user or log it
        });
		
		}
  }

  handleMessageCallback(topic, message) {
    if (this.messageCallbacks && this.messageCallbacks.onMessage) {
      this.messageCallbacks.onMessage(topic, message);
    }
    if (this.messageCallbacks && this.messageCallbacks.onMessage_Hive) {
      this.messageCallbacks.onMessage_Hive(topic, message);
    }
  }

  handleCallback(callbackName, ...args) {
    if (this.messageCallbacks && this.messageCallbacks[callbackName]) {
      this.messageCallbacks[callbackName](...args);
    }
    const hiveCallbackName = `${callbackName}_Hive`;
    if (this.messageCallbacks && this.messageCallbacks[hiveCallbackName]) {
      this.messageCallbacks[hiveCallbackName](...args);
    }
  }
}


