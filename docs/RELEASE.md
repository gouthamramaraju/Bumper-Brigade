# Phone release checklist

This package includes one racing game, plus Android and iOS project source. It is not published to either store. Generated native files use a placeholder application ID; choose your own before submission.

1. Finish the browser and device checks in TESTING.md.
2. Choose a stable reverse-domain ID such as `com.yourname.bumperbrigade`. If changing the already generated ID, remove/recreate `mobile/android` and `mobile/ios` before generating again. Keep a backup of any native changes first.
3. Run the command in HOSTING.md with your production HTTPS server and chosen ID. This updates copied web assets and synchronizes native dependencies.
4. Open `mobile/android` in Android Studio. Configure signing and build an Android App Bundle. Open the iOS project in Xcode on a Mac, choose your signing team, archive and upload through Apple's tools.
5. Replace template launcher icons and splash assets with your final branding. Native templates currently contain their default icons. Set version numbers, app descriptions, age ratings, screenshots and privacy/data-safety answers based on what the final deployed app actually collects.
6. Set up your store developer accounts and complete their identity/business verification. Read the current store requirements, testing gates and fees directly before paying or submitting; they can change.
7. Publish a real privacy policy and support/contact URL. Submit for review and fix any reviewer issues.

The game has no advertising, purchases, accounts, chat, camera or location access. Online play needs network access. Hosting providers may log IP addresses, and Android/iOS platform defaults must be reviewed. Store approval and same-day availability cannot be guaranteed. App size must be measured from the compiled builds; source size is not installed size.
