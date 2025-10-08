const NodeHelper = require("node_helper");
const https = require("https");
module.exports = NodeHelper.create({
    start: function(){
        console.log("Starting module: " + this.name)
    },
    socketNotificationReceived: function (notification, payload) {
        var self = this;
        if (notification == "getstop") {
            const postData = JSON.stringify(payload.body);
            
            console.log("[MMM-Skyss] Making API request to Skyss v3");
            console.log("[MMM-Skyss] Request body:", postData);
            
            const options = {
                hostname: 'skyss.giantleap.no',
                path: '/v3/departures',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            var req = https.request(options, (res)=>{
                console.log("[MMM-Skyss] API response status:", res.statusCode);
                
                res.setEncoding('utf8');
                var data = "";
                res.on('data', (chunk) => {
                    data = data.concat(chunk);
                });

                res.on('end', ()=>{
                    console.log("[MMM-Skyss] API response received, data length:", data.length);
                    console.log("[MMM-Skyss] Response preview:", data.substring(0, 200) + "...");
                    self.sendSocketNotification("getstop", {response:data});
                });
            });
            
            req.on('error', (e) => {
                console.error("[MMM-Skyss] API request error:", e.message);
                self.sendSocketNotification("getstop", {err:e});
            });
            
            req.write(postData);
            req.end();
        }
    }
});
