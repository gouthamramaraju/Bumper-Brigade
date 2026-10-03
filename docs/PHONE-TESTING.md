# Test with friends on phones

## Same Wi-Fi: test immediately

Start the game on your Mac with `npm start`. Open System Settings → Wi-Fi → Details → TCP/IP and find the Mac's IP address, for example 192.168.1.25. On each phone connected to the same Wi-Fi, open `http://192.168.1.25:8080` (replace the example with your address). Keep the Mac awake and the server running. Allow Node incoming connections if macOS asks. Guest networks may prevent devices from talking to one another.

Choose different vehicles. One person creates a room and shares its six-character code; others enter the code and join. The host starts the race after everyone joins. Rooms support at most ten players. Everyone must open the same server address.

## Different homes: deployed HTTPS link

The server must be deployed first. Railway can build the included Dockerfile and give the service a public domain. Deploy one replica, expose the application's PORT, and use `/health` as the health-check path. No database is needed for test races. Do not enable sleeping/serverless behaviour while testing live rooms. Check the provider's billing before starting paid resources.

Once deployment is verified, share the actual HTTPS game link with friends. Phones need no app-store download. A room code by itself is not a website address. Each player can choose their own vehicle; only the host chooses the map and starts the race. Rooms disappear on server restart.

## Optional home-screen shortcut

On iPhone Safari, use Share → Add to Home Screen. On Android Chrome, look for Add to Home screen or Install app in the browser menu; availability varies. A shortcut is optional: ordinary browser play works. Offline solo caching requires an initial HTTPS visit; online rooms always need internet.

The circular control steers only. Gas and Brake are separate buttons on the right. Phone races fill the browser viewport and start in whole-map view. Use Follow view for close driving, or Full screen where supported. On iPhone, Add to Home Screen gives a standalone view.

## Small test checklist

Try portrait and landscape, sound, left/right steering, brake, fire, boost and drift. Test a collision, a three-second respawn and a replay. Switch apps briefly and check that controls release. If disconnected, leave and rejoin between rounds; a disconnected race cannot resume.
