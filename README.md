<p align="center">
  <img src="https://github.com/JoeSzymkowiczFiveM/fivem_mongodb/assets/70592880/c4a6d7bb-ab6f-4516-8394-ed905f93f8f7">
</p>


# fivem_mongodb

A FiveM resource to communicate with a MongoDB database using [mongodb](https://www.npmjs.com/package/mongodb).


## ✨ Features

- I have included as many MongoDB methods as I could in this wrapper, even a couple that I could not find use for at present time. Maybe someone else will.


## 📚 Installation

- Clone this repository to `fivem_mongodb` in your FiveM `resources` folder.
- Copy `fivem_mongodb/database.cfg` to your server root directory.
- Add the following lines to your server config:
```
exec "database.cfg"
start fivem_mongodb
```
- Change `mongodb_url`, and `mongodb_database` in `database.cfg`.
- Run `npm install` in `resources/fivem_mongodb` directory.


## 👀 Usage

- Add the following line to the fxmanifest of the resource you want to use fivem_mongodb in:
```
server_script '@fivem_mongodb/lib/MongoDB.lua'
```


## 👐 Credit

I began working on this as a fork of [fivem-mongodb](https://github.com/nbredikhin/fivem-mongodb) and decided to create my own repo with full credit back to `alcoholiclobster`. Also, huge shoutout to the [Overextended](https://github.com/overextended) group for technical discussions and support.


# Discord

[Joe Szymkowicz FiveM Development](https://discord.gg/5vPGxyCB4z)
