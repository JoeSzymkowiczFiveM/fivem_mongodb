fx_version 'cerulean'
game 'common'

lua54 'yes'

author 'alcoholiclobster'
description 'MongoDB wrapper for FiveM, updated and maintained by JoeSzymkowiczFiveM.'
version '2.0.0'

dependencies {
	'/server:5104',
}

server_scripts {
    "index.js",
}

convar_category 'fivem_mongodb' {
	'Configuration',
	{
		{ 'Connection url', 'mongodb_url', 'CV_STRING', 'mongodb://localhost:27017' },
        { 'Connection database name', 'mongodb_db', 'CV_STRING', 'fivem' },
	}
}