export class MQTTService {
  constructor(host, messageCallbacks) {
    this.mqttClient = null;
    this.host = host;
    this.messageCallbacks = messageCallbacks;
  }

  connect(options) {
    this.mqttClient = mqtt.connect(this.host,options);

    // MQTT Callback for 'error' event
    this.mqttClient.on("error", (err) => {
      console.log(err);
      this.mqttClient.end();
      if (this.messageCallbacks && this.messageCallbacks.onError)
        this.messageCallbacks.onError(err);
	   if (this.messageCallbacks && this.messageCallbacks.onError_Hive)
        this.messageCallbacks.onError_Hive(err);
	
    });

    // MQTT Callback for 'connect' event
    this.mqttClient.on("connect", () => {
      console.log(`MQTT client connected`);
      if (this.messageCallbacks && this.messageCallbacks.onConnect) {
        this.messageCallbacks.onConnect("Connected");
      }
	  if (this.messageCallbacks && this.messageCallbacks.onConnect_Hive) {
        this.messageCallbacks.onConnect_Hive("Connected");
      }
    });

    // Call the message callback function when message arrived
    this.mqttClient.on("message", (topic, message) => {
      if (this.messageCallbacks && this.messageCallbacks.onMessage) {
        this.messageCallbacks.onMessage(topic, message);
		return;
      }
	   if (this.messageCallbacks && this.messageCallbacks.onMessage_Hive) {
        this.messageCallbacks.onMessage_Hive(topic, message);
      }
    });

    this.mqttClient.on("close", () => {
      console.log(`MQTT client disconnected`);
      if (this.messageCallbacks && this.messageCallbacks.onClose)
        this.messageCallbacks.onClose();
    
	    if (this.messageCallbacks && this.messageCallbacks.onClose_Hive)
        this.messageCallbacks.onClose_Hive();
    });
  }

  // Publish MQTT Message
  publish(topic, message, options) {
    this.mqttClient.publish(topic, message,options);
  }

  // Subscribe to MQTT Message
  subscribe(topic, options) {
    this.mqttClient.subscribe(topic, options);
  }
}
