# What has been checked

Automated checks cover deterministic races on all six tracks, mixed vehicle grids, ordered checkpoints, scoring, collision damage, weapons, pickups and exactly three seconds to respawn. Real WebSocket tests connect ten players to every map, reject an eleventh, check host permissions, separate vehicle choices, stale controls, replay, native origins and malformed requests. A simulated DOM test exercises real UI handlers. Canvas previews use the actual drawing code.

A simulated DOM is not a real browser. Full browser layout, phone performance, touch on physical devices, native compilation/signing and store review remain unverified. Native projects are generated source, not installable signed apps.

## Your final testing

1. Run `npm ci`, `npm test`, `npm start`; open localhost:8080.
2. Try all four rides on all six maps. Check steering, brake, boost, drift and fire. Compare auto-drive on and off.
3. Wreck a vehicle. Check the explosion, 30-point deduction and three-second return. Test banana spins and the pulse near another vehicle.
4. Play with another browser/device on the same server. Change each player's vehicle independently, then start and replay. Try ten clients if you can.
5. Test a small portrait phone and landscape phone. Check that steering, gas and weapon buttons remain reachable, and that backgrounds/overlays fit.
6. Switch tabs, disconnect Wi-Fi, leave/rejoin a room and close the host's browser. Inputs should stop, disconnected players leave, and host control transfers.
7. On physical iOS/Android builds, test sound, touch, safe areas, networking and app background/foreground behaviour.

There is no reconnect/resume feature for a disconnected player. An online race does not pause when one player leaves the tab. Public server capacity and abuse resistance require real deployment load testing.
