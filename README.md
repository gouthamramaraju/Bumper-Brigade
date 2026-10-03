# Bumper Brigade

A small 2D battle racer for 1–10 players. Choose a car, bike, bus or spaceship, then race through six tracks: city, canyon, space, ice, beach and volcano. The pictures are drawn by code, so there are no large image downloads.

## Run on your Mac

Install Node.js 22 or newer first. Extract this ZIP into Downloads. Open Terminal and type these commands, one line at a time:

```sh
cd ~/Downloads/bumper-brigade
npm ci
npm start
```

Open **http://localhost:8080**. Keep Terminal open. To stop the game, press Control+C. If another game already uses port 8080, stop it first. `cd` means “change directory”; `cs` is not a command. Run `npm ci` inside the folder containing both `package.json` and `package-lock.json`.

## Play

Pick a vehicle and map. Solo can include zero to nine computer drivers. To play with friends, create a room and share its six-character code. Everyone must use the same server address; a code alone cannot connect separate servers. Localhost works only on your own computer. On home Wi-Fi, others can use your computer's LAN address with port 8080. For internet play, deploy the server with HTTPS and WebSocket support: see [hosting](docs/HOSTING.md).

Auto-drive is on initially: steer with A/D or left/right arrows. W/up accelerates, S/down brakes or reverses, Shift boosts, E drifts and Space fires. Phones use a circular thumb control: sideways steers; separate Gas and Brake buttons sit on the right. Weapon, boost and drift remain separate. Auto-drive can be switched off. Escape pauses a solo race; online races continue for everyone. Sound starts off; enable it with the sound button.

## Rules

- Pass the checkpoints in order. Finish three laps, or race until the two-minute limit. After the first finish, others have up to 12 seconds to finish.
- Race position follows laps and checkpoints. Points are a separate score; they cannot buy first place.
- A checkpoint gives 10 points, a lap 100, finishing 200. A wreck costs 30 points, stopping at zero. Causing another driver's wreck earns 25.
- Hard bumps and obstacles damage vehicles. A wreck explodes and returns to its last checkpoint after **three seconds**, with two seconds of protection. Staying pinned against something while accelerating can also wreck you.
- Collect weapons, repairs and boost. Weapons include a bouncing-looking rocket, a spinning banana peel and a nearby bonk pulse. Collectibles reappear after eight seconds.
- Bikes are quick but fragile. Buses are tough but slow to turn. Spaceships slide more. Cars balance the choices.

## Learn or change it

Read [the student guide](docs/STUDENT-GUIDE.md). Run `npm test` to check physics, real multiplayer sockets and UI handlers. Run `npm run preview` to produce pictures from the actual drawing code. These pictures are not phone or browser screenshots.

The downloadable source ZIP includes generated Android and iOS project sources in `mobile/`. In a GitHub checkout, generate them with `npm run build:mobile -- --native`. They are unsigned and have not been compiled or published. See [release steps](docs/RELEASE.md). See [testing](docs/TESTING.md) for checks you should do before release and [GitHub](docs/GITHUB.md) to publish the source.

Original game code is MIT licensed. Keep the licence and third-party notices when sharing it.
