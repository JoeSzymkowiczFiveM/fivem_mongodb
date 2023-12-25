local MongoDB = {}
local mongodb = exports.fivem_mongodb

setmetatable(MongoDB, {
    __index = function(self, method)
        self[method] = setmetatable({}, {
            __call = function(...)
                return mongodb[method](...)
            end,
            __index = function(_, key)
                if (method == "Async") then
                    return function(params, cb)
                        return mongodb[key](mongodb, params, cb)
                    end
                end
            end
        })
        return self[method]
    end
})

local function onReady(cb)
	while GetResourceState('fivem_mongodb') ~= 'started' do
		Wait(50)
	end

	repeat
        Wait(5)
    until mongodb:isConnected()
    cb()
end

MongoDB.ready = setmetatable({
	await = onReady
}, {
	__call = function(_, cb)
		Citizen.CreateThreadNow(function() onReady(cb) end)
	end,
})

_ENV.MongoDB = MongoDB