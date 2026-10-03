# Third-party notices

Original game code, CSS illustrations and procedurally generated icons are covered by the root MIT licence.

Runtime dependencies:

- **ws 8.22.0**, MIT; used by the Node multiplayer server. Copyright Einar Otto Stangvik, Arnout Kazemier and contributors, Luigi Pinca and contributors. Full notice: `docs/licenses/ws-MIT.txt`.
- **Capacitor 8.5.2**, MIT; used by the generated Android/iOS apps. Copyright 2017-present Drifty Co. Full notice: `docs/licenses/capacitor-MIT.txt`.
- The Android Gradle wrapper and Android build tools have their own notices/licences; the wrapper originates from the Capacitor Android project template. See https://github.com/gradle/gradle/blob/master/LICENSE.
- Android/iOS platform libraries and generated dependency trees retain their original licences. Their package/source notices must remain intact when redistributing them.

Development-only dependencies include the Capacitor CLI, happy-dom and @napi-rs/canvas. They support project generation, simulated UI checks and arena previews. They are not included in the browser game assets or the production Node server's dependency set. Exact direct and transitive versions are recorded in `package-lock.json`; installed packages contain their licence notices. Do not claim third-party code as original game code.
