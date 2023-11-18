# UIUC Bus Tracker
A bus tracker for all of UIUC: Campus, Champaign, and Urbana!


## Setup
Run
 ```bash
 git clone https://github.com/GSDV/uiuc-bus-tracker.git
 ```
to get the code.

Then sign up for an API key at [Champaign Urbana MTD](https://developer.cumtd.com/).

Make a "fetch.js" file in the "js" folder, then add the following:
```javascript
const const API_KEY = // Your API Key
const VER = // Your version (e.g. "v2.2")
const REQ_URL = `https://developer.cumtd.com/api/${VER}/json/`;
```
The suggested version is "v2.2", since that is what this project has been built around.

A working version can be found [here](https://gsdv.me/uiuc/bus).


## How to Use
This UIUC bus tracker tracks all active bus stops and routes in Champaign and Urbana, Illinois. You can search through all bus stops, as well as view bus stops nearby. It allows for favorited stops, conveniently giving you the bus information you frequently use. Use the trip planner to organize a trip with multiple buses.


<img src="https://github.com/GSDV/uiuc-bus-tracker/blob/main/img/thumbnail.png" alt="Homepage" style="width:100%;"/>
