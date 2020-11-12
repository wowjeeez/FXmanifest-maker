const { ipcRenderer } = require('electron')
const $ = require('jquery')
$(() => {
    $(".main").fadeIn(500)
    $(".meta").hide()
    $(".parse").hide()
    $(".finalize").hide()
    $(".done").hide()
    console.log("Running browser thread")
    $(".open").click(() => {
        ipcRenderer.send("openFolder")
    })

    $("#metaD").click(() => {
        var game = $("#game").val()
        if (game = "both") {
            game = `"gta5", "rdr3"`
        }
        if (game == "common") {
            game = "'common'"
        }
        const meta = {
            fxv: $("#fxv").val(),
            game: game,
            auth: $("#author").val() || "no one",
            descr: $("#descr").val() || "nothing"
        }
        ipcRenderer.send("metadata", meta)
        $(".meta").fadeOut(100, () => {
            $(".parse").fadeIn(100)
        })

    })
    $("#createFile").click(() => {
        ipcRenderer.send("build")
    })
    $("#exit").click(() => {
        ipcRenderer.send("exit")
    })
})

ipcRenderer.on("openForm", (event, data) => {
    $(".main").fadeOut(500, () => {
        $(".meta").fadeIn(500)
    })
})

ipcRenderer.on("parsedFiles", (event, data) => {
    $(".parse").empty()
    $(".finalize").show()
    $(".results").empty()
    $(".results").append(`<tr>
    <th>Name</th>
    <th>Entry type</th>
</tr>`)
    data.forEach(entry => {
        $(".results").append(`<tr><td>${entry.name}</td><td>${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</td></tr>`)
    })
})

ipcRenderer.on("written", (event) => {
    $(".finalize").fadeOut(500, () => {
        $(".done").fadeIn(500)
    })
})