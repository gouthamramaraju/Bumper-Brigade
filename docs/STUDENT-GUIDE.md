# How the game works, in simple language

Think of the game as three jobs: remember what is happening, draw it, and listen to the player.

| File | Job |
| --- | --- |
| `public/index.html` | The garage, buttons, lobby and score screens |
| `public/style.css` | Colours, spacing and phone layouts |
| `public/joystick.js` | Convert thumb drags into steering, gas and brake; release on cancellation |
| `public/app.js` | Connect buttons and keys to the game; run solo play |
| `public/vehicles.js` | Each vehicle's speed, strength, size and turning ability |
| `public/maps.js` | Track corners, obstacles and collectible locations |
| `public/physics.js` | Movement, bumps, weapons, checkpoints and scoring |
| `public/render.js` | Draw the tracks, vehicles, particles and camera view |
| `public/audio.js` | Make short sound effects without sound files |
| `server.mjs` | Serve the files and run shared multiplayer races |
| `tests/` | Automatically check important behaviour |
| `scripts/build-mobile.mjs` | Copy the web game into phone project folders |

## One game tick

A tick is one small step in time. The code reads the steering and accelerator, moves each vehicle, checks bumps and checkpoints, then updates scores. Solo uses 60 steps each second. The server uses 30 and sends updates 15 times each second. Drawing runs separately so the camera can move smoothly.

In multiplayer the server decides positions and scores. A browser sends controls rather than a claimed score. This prevents simply sending “I have 999 points.” It is not a complete anti-cheat system.

## Change a vehicle

Open `public/vehicles.js`. `maxSpeed` is its top speed, `accel` is how quickly it speeds up, `turn` controls steering, `hp` is how much damage it survives, and `mass` affects bumps. Change one number, save, restart the server, refresh the page and try it. Do not increase everything together: different strengths make the choices interesting.

## Change a map

Open `public/maps.js`. A map has a name, world size, road width, a list of points and obstacles. The points connect in order and the final point connects back to the first. Those same points also act as ordered checkpoints. Put obstacles near the road, leaving space to drive around them. Existing map IDs are `city`, `canyon`, `space`, `ice`, `beach` and `volcano`.

`gripMultiplier` changes how strongly tyres resist sliding. Polar Panic uses 0.55; a smaller number makes steering more slippery. Lava is decorative scenery; the rocks are solid obstacles. There is no instant lava damage.

## Change rules safely

Find the scoring and damage code in `public/physics.js`. For example, `explode` applies the 30-point penalty and sets the return time three seconds later. Update the tests if you intentionally change a rule; do not delete failing tests just to hide a mistake. Always test all four vehicles and all maps.

## Recreate the project

Extract the ZIP, install Node, run `npm ci`, then `npm test` and `npm start`. The lockfile records the exact dependency versions. All visible art and sound are produced by code. You do not need an art subscription, API key, game engine subscription or paid asset pack to run it.

Once you change browser files, run `npm run build:mobile -- --native` again before building phone apps. Remove old website service-worker caches when checking a new version, or use a private window.


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
