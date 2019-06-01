# Pushover notifications for Athom Homey

This app lets you send Pushover notifications to use in flows on a Homey device (by Athom).

1. Go to Pushover.net and login
2. Grab your user key
3. Grab your relevant group key (if used)
4. Create a new application for Homey https://pushover.net/apps/build
5. Grab your created application key
6. Go to settings on your Homey, and under Pushover Notifications fill in your user, group & application/token key and save.

## Donate
If the Pushover app is useful to you, buy me a beer!

[![Paypal donate][pp-donate-image]][pp-donate-link]

[pp-donate-link]: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=D8RA9P824YZ62&lc=NL&item_name=Pushover%2dHomey&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted
[pp-donate-image]: https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif

## Changelog

### 0.0.12
* Multiple fixes (thanks to Vekdkornet):
* Updated colour scheme to "Pushover blue"
* Support for group notifications. Add your group key under settings. 
* Additional Dutch translations

### 0.0.11
* Multiple fixes (thanks to Vekdkornet):
* Fixed an issue where all messages were being sent as "Normal" priority
* Fixed an issue where the send message to device flow would not work
* Added Notification Sound on the Image Flow Card
* Added support for Custom Subject
* Added support for Device Default Sound
* Added support for Emergency Priority

### 0.0.10
* Fixed device selection in flow card
* Added confirmation for saved settings

### 0.0.9
* Image support thanks to Kevin Traa

### 0.0.8
* Fixed bug where logging didn't work for pushover device card

### 0.0.7
* Added check to see if Message isn't empty to fix app crash
* Added Insight logging support
