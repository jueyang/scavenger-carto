## An express app for teams to check their progress during Scavenger Hunt 

https://scavenger-hunt-2015.herokuapp.com

- [The rules of the hunt](http://bit.ly/scavengers2015)
- [The map of all teams](https://jue.cartodb.com/viz/b887b6ec-4487-11e5-ad67-0e853d047bba/public_map)

_The scavenger took place on Aug 20, 2015._ To get a feel of how a team used this site on the day of the hunt, use `teamfabfiveonit` (the actual grand prize winner.)

## Site flow

The site is intended to be used on the phone, when teams are running in the field and posting pictures.

It checks hashtagged instagram posts and store relevant* ones to a CartoDB database, which is used to make the **team progress map** and **all teams map**.

*= A relavant post has a correct hashtag (the desired team name) and a location.

## Develop documentation

`npm install`

This section will be added soon. A dev backlog is in https://github.com/jueyang/scavenger-carto/issues/15.

A CartoDB account is needed. Both CartoDB.js and CartoDB SQL API are used for the site. The current code does not reflect the setup of the account.
