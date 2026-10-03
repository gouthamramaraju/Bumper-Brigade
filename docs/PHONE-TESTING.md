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


### Driving view and personal settings
Races open in real 3D from behind your vehicle. WebGL draws solid triangle meshes with lighting, depth testing and a smooth camera. The shared collision rules use ground coordinates, which keeps the server small. Map view switches back to the overhead view.

Open Settings in the garage or during a race. Change camera height, distance, view angle and zoom. Select a keyboard field and press a new key to assign it. Each action needs a different key. Arrow keys also operate steering and pedals. Your choices are saved on this device. Reset restores the camera and keys. On phones the left circle steers, with Gas, Brake, Drift, Boost and Bonk on the right.

Choose a time limit between 30 and 1800 whole seconds in the garage. In a friend room, only the host changes the shared limit before starting. This is the maximum time: three laps can finish the race earlier, with the existing 12-second finish countdown. Camera and keys are personal; they do not change other players' views. Settings pause solo races, while online races keep running.

To replicate this feature, read `public/settings.js` for saved preferences and validation, `public/three-d.js` for 3D drawing, `public/app.js` for screen controls, and `server.mjs` for the host's shared timer. Run `npm ci`, then `npm test`, then `npm start`.


### Circuit and Endless (0.5.0)
Choose Track style in the garage. Circuit is a complete looping 3D course with three laps. Endless is a continuously generated, gently curving highway: keep driving until the selected timer ends. The six map choices set scenery and grip in both modes. The host chooses track style for the whole friend room; everyone still chooses their own vehicle.

Endless does not have a finish line. Its distance display shows your farthest forward progress; distance checkpoints award points. Obstacles, weapons, collisions and three-second respawns still work. Respawns return near your progress. Bird’s-eye view gives an overhead 3D camera. The default driving camera shows the road stretching into the distance.

The renderer is `public/three-d.js`: it builds small coloured meshes and sends their triangles to WebGL. It needs no 3D model or texture downloads. `public/endless.js` describes the road using simple sine curves and deterministic obstacle positions; the browser and server use the same functions. Circuit geometry is rendered in full. Endless renders a moving road window from behind the driver to far ahead, fading naturally into the horizon.

Test both styles, turning and braking, every vehicle, settings, portrait and landscape. A device needs WebGL for 3D; unsupported devices show a warning and use the older 2D fallback. Physical iPhone and Android performance still needs testing.


### Scenic Drive and richer vehicle models (0.6.0)
Scenic Drive is an untimed cruise inspired by the feel of scenic driving games. Choose it under Track style. It keeps generating road through rolling hills, without weapons, damage, road hazards or a race finish. Multiplayer hosts can also select it. Circuit and Endless Battle keep their existing rules and timers.

The road, terrain, vehicles and camera share the same elevation functions in `public/landscape.js`. The camera follows the road grade. Landscape meshes are cached until you move into another road section, which reduces repeated work. In Settings, choose behind-the-vehicle, hood or driver camera. Scenic Drive hides the combat HUD to leave more of the road visible.

`public/vehicle-models.js` builds original solid models: shaped car body and cabin, wheel rims, lamps and mirrors; bus windows and extra wheels; bike frame, engine, tires and rider; spaceship wings, canopy and thrusters. Lit surfaces have a small specular highlight. These are compact procedural models, not photorealistic scanned models or images. No model or texture downloads are needed.

Run `node scripts/preview-3d.mjs` to project the real mesh and camera data into a CPU-rendered inspection image. This verifies geometry framing and depth; it does not verify browser shader compilation. WebGL appearance and phone performance still need a device test.


### Vehicles and animals together (0.7.0)
The garage now has nine choices: car, bike, bus, spaceship, fox, rabbit, bear, deer and elephant. Players can mix animals and vehicles in the same 1–10 player room, in Scenic Drive, Circuit or Endless Battle. Vehicles stay available. When you choose an animal, the phone pedals show Run and Slow. Keyboard bindings stay the same so you do not need to learn another control layout.

The animals are original solid 3D models, with running or hopping legs, body bounce, tails, ears and eyes. `public/animal-models.js` builds and animates them. Each animal has a natural coat and a colored neck band for identifying players. The shared racer data remains in `public/vehicles.js`; an `animal` flag selects the animal model and camera height. `public/vehicle-models.js` forwards animal choices to that renderer while continuing to draw vehicles.

Animal meshes use the existing road elevation, camera and multiplayer state. No model files, textures or image downloads are needed. The garage uses one shared preview renderer to avoid creating nine graphics contexts on a phone. Devices without WebGL still show a warning and a compatibility silhouette. Actual animal motion, visual quality and performance should be checked on an iPhone and Android device.

To inspect geometry, run `node scripts/preview-3d.mjs fox` or use `rabbit`, `bear`, `deer`, `elephant` or a vehicle ID. This creates a CPU projection of the actual scene data, not a browser screenshot.


### Tilt steering
Open Settings, hold the phone in a comfortable driving position, and tap **Enable tilt**. Allow motion access if asked. Tilt left or right; gas/run and brake/slow stay on the right. Tap **Calibrate straight ahead** to make your current phone position neutral. Lower the full-steering degrees for stronger sensitivity. Rotate the phone and it automatically finds a new neutral position. The circle and keyboard always remain available; dragging the circle overrides tilt. If motion access is blocked or sensor readings stop, tilt returns zero steering.

For students: `public/tilt.js` converts phone sensor readings to the same steering number the game already uses. No sensor data is sent to the server. Test on a real iPhone and Android over HTTPS: permission allowed/denied, both landscape directions, portrait, calibration, app switching, gas/brake while tilting, and multiplayer. Automated tests cannot verify a physical phone's sensor feel.
