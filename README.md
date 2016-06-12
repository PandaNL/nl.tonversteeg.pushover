# Pushover notifications for Athom Homey

This app lets you send Pushover notifications to use in flows on a Homey device (by Athom).

1. Go to Pushover.net and login
2. Grab your user key
3. Create a new application for Homey https://pushover.net/apps/build
4. Grab your created application key
5. Go to settings on your Homey, and under Pushover Notifications fill in your user & application/token key and save.

### Donate
If the Pushover app is useful to you, buy me a beer!

[![Paypal donate][pp-donate-image]][pp-donate-link]

[pp-donate-link]: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=D8RA9P824YZ62&lc=NL&item_name=Pushover%2dHomey&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted
[pp-donate-image]: https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif

### Changelog

0.0.7

- Added check to see if Message isn't empty to fix app crash
- Added Insight logging support
