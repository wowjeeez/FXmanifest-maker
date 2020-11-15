const fs = require("fs")
class Query {
    constructor(table) {
        this.table = table
    }
    query = function(prop, cb) {
        const table = this.table
        if (fs.existsSync(__dirname + `/storage/${table}.json`)) {
            const raw = JSON.parse(fs.readFileSync(__dirname + `/storage/${table}.json`))
            if (prop.whole) {
                cb(raw)
            }
            if (!prop.key) {
                for (const [key, value] of Object.entries(raw)) {
                    if (value[prop.compare] == prop.with) {
                        prop.key = key
                        break
                    }
                }
            }
            if (prop.key && !prop.fields) {
                cb(raw[prop.key] || {}, prop.key)
            }
            if (prop.fields && prop.key) {
                const entry = raw[prop.key]
                const ret = {}
                prop.fields.forEach(f => {
                    ret[f] = entry[f]
                })
                cb(ret)
            }
        } else {
            //(`^1 [ERROR]: Table doesn't exist`)
            cb(false)
        }
    }
    delete = function(prop) {
        const table = this.table
        if (fs.existsSync(__dirname + `/storage/${table}.json`)) {
            const raw = JSON.parse(fs.readFileSync(__dirname + `/storage/${table}.json`))
            if (prop.whole) {
                raw = {}
            }
            if (!prop.key) {
                //()
                for (const [key, value] in raw) {
                    if (value[prop.compare] == prop.with) {
                        prop.key = key
                    }
                }
            }
            if (prop.key && !prop.fields) {
                raw[prop.key] = null
            }
            if (prop.fields && prop.key) {
                const entry = raw[prop.key]
                for (const [key, value] of Object.entries(prop.fields)) {
                    raw[prop.key][key] = null
                }
            }
            fs.writeFileSync(__dirname + `/storage/${table}.json`, JSON.stringify(raw, null, 2));
        } else {
            //(`^1 [ERROR]: Table doesn't exist`)
        }
    }
    update(key, data) {
        const table = this.table
        if (fs.existsSync(__dirname + `/storage/${table}.json`)) {
            const raw = JSON.parse(fs.readFileSync(__dirname + `/storage/${table}.json`))
            for (const [k, value] of Object.entries(data)) {
                raw[key][k] = value
            }
            fs.writeFileSync(__dirname + `/storage/${table}.json`, JSON.stringify(raw, null, 2));
        } else {
            //(`^1 [ERROR]: Table doesn't exist`)

        }
    }
}

class Inserter extends Query {
    constructor(name) {
        super(name)
        this.name = name
    }
    insert = function(key, overwrite, data) {
        if (fs.existsSync(__dirname + `/storage/${this.name}.json`)) {
            this.loaded = JSON.parse(fs.readFileSync(__dirname + `/storage/${this.name}.json`))
            if (!this.loaded[key] || overwrite) {
                this.loaded[key] = data
                fs.writeFileSync(__dirname + `/storage/${this.name}.json`, JSON.stringify(this.loaded, null, 2));
            } else {
                //(`^1 [ERROR]: Duplicate key detected and overwriting is not allowed`)
            }
        } else {
            //(`^1Table doesn't exist`)
        }

    }
}
class Accessor extends Inserter {
    constructor(name) {
        super(name)
    }
}

class Table extends Accessor {
    constructor(name, overwrite = false, data) {
        super(name)
        const obj = data || {}
        if (!fs.existsSync(__dirname + `/storage/${name}.json`) || overwrite) {
            fs.writeFileSync(__dirname + `/storage/${name}.json`, JSON.stringify(obj, null, 2), err => {
                if (err) {
                    //(`^1Error occured: ${err}`)
                } else {
                    //(`^2New table created with name ${name}`)
                }
            })
        } else {
            //(`^1 [ERROR]: A table with this name already exists`)
        }
        return this
    }
}

module.exports = { Accessor, Table, Inserter, Query }