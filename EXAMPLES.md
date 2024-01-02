## 📝 Usage Examples

Below are several examples of the function to use MongoDB.

## ✔️ Ready function
### MongoDB.ready
```lua
MongoDB.ready(function()
    -- put code here that will be executed after the database connects
end)
```

## ✏️ Insert/Create functions
### MongoDB.insertOne
```lua
local insertOneResult = MongoDB.insertOne({collection = 'test', document = {permission = 'god', name = 'Joe', citizenid = 1}})
print(insertOneResult)

MongoDB.Async.insertOne({collection = 'test', document = {permission = 'admin', name = 'Jack', citizenid = 2}}, function(insertOneResultAsync)
    print(insertOneResultAsync)
end)
```

## ✏️ Update/Modify functions
### MongoDB.updateOne
```lua
local result4 = MongoDB.Async.updateOne({collection = 'test', query = {name = 'Joe'}, update = { ["$set"] = { name = 'Joseph' } }, options = { upsert = true }})
print(json.encode(findOneAndUpdateResult, {indent=true}))
```

### MongoDB.findOneAndUpdate
```lua
local findOneAndUpdateResult = MongoDB.findOneAndUpdate({collection = 'test', query = { permission = 'god' }, update = { ["$set"] = { permission = 'normie' } } })
print(json.encode(findOneAndUpdateResult, {indent=true}))
```

## 🗑️ Delete functions
### MongoDB.findOneAndDelete
```lua
MongoDB.findOneAndDelete({collection = 'test', filter = { permission = 'admin' } })
```

### MongoDB.deleteMany
```lua
MongoDB.deleteMany({collection = 'test'})
```
