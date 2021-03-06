var request = require("request")
var CryptoJS = require("crypto-js")
var RestDB_API = "KEY_62c27fbfe91195203e3aa7b9"
RestDB_API = RestDB_API.slice(4)

const encrypt = (text, passphrase) => {
  return CryptoJS.AES.encrypt(text, passphrase).toString()
}

const decrypt = (ciphertext, passphrase) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase)
  const originalText = bytes.toString(CryptoJS.enc.Utf8)
  return originalText
}

var xbias = 0
var lastid = 0
window["ready"] = false
window["editing"] = false
window["newArrow"] = false

window.onload = function() {
    if (window["ready"]) {
        display()
    }
    else {
        window["ready"] = true
    }
}

function display() {
    objects.forEach(obj => {
        newObj(obj.class, obj)
    })

    document.getElementById("addmenu").style.zIndex = 3
}

function newObj(type, obj = null) {
    switch (type) {
        case "Head":
            if (obj == null) {
                var obj = {
                    "id": objects.length,
                    "class": "Head",
                    "title": "New Head Block",
                    "description": "A storyline, event or person.",
                    "color": "FFFFFF",
                    "position": [
                        5,
                        5
                    ]
                }
                objects.push(obj)
            }

            var tag = document.createElement("div")
            tag.id = obj.id
            tag.classList.add("head")
            tag.classList.add("object")
            tag.addEventListener("dblclick", function() { moveObj(tag) })
            
            tag.style.borderColor = "#" + obj.color
            tag.style.marginLeft = (obj.position[0] + "em")
            tag.style.marginTop = (obj.position[1] + "em")

            var text = document.createElement("input")
            text.type = "text"
            text.setAttribute("oninput", "this.size = this.value.length")
            text.value = obj.title
            text.size = text.value.length
            text.readOnly = true
            tag.appendChild(text)

            var color = document.createElement("input")
            color.type = "color"
            color.classList.add("colorPicker")
            color.setAttribute("value", "#" + obj.color)
            color.addEventListener("change", function() { updateColor(color) })
            tag.appendChild(color)

            var tooltip = document.createElement("textarea")
            tooltip.value = (obj.description != null) ? obj.description : ""
            tooltip.classList.add("tooltip")
            tooltip.size = tooltip.value.length
            tooltip.readOnly = true
            tooltip.setAttribute("oninput", `
                this.style.height = 'auto'
                this.style.height = this.scrollHeight+'px'
                this.scrollTop = this.scrollHeight
                window.scrollTo(window.scrollLeft,(this.scrollTop+this.scrollHeight))
            `)
            tag.appendChild(tooltip)
            
            document.getElementsByTagName("BODY")[0].appendChild(tag)

            tooltip.style.height = 'auto'
            tooltip.style.height = tooltip.scrollHeight+'px'
            tooltip.scrollTop = tooltip.scrollHeight

            if (!document.getElementById(obj.color + "-arrow")) {
                var arrow = document.getElementById("arrow").cloneNode(true)

                arrow.setAttribute("id", obj.color + "-arrow")

                arrow.children[0].setAttribute("fill", "#" + obj.color)

                var element = document.getElementsByTagName("defs")[0]
                element.appendChild(arrow)
            }
            break

        case "Sub":
            if (obj == null) {
                var obj = {
                    "id": objects.length,
                    "class": "Sub",
                    "title": "New Sub Block",
                    "description": "A specific event",
                    "headId": 1,
                    "position": [
                        5,
                        5
                    ]
                }
                objects.push(obj)
            }

            var tag = document.createElement("div")
            tag.id = obj.id
            tag.classList.add("sub")
            tag.classList.add("object")
            tag.addEventListener("dblclick", function() { moveObj(tag) })
            tag.style.borderColor = "#" + objects[obj.headId].color
            tag.style.marginLeft = (obj.position[0] + "em")
            tag.style.marginTop = (obj.position[1] + "em")

            var text = document.createElement("input")
            text.type = "text"
            text.setAttribute("oninput", "this.size = this.value.length")
            text.addEventListener("input", function() {
                updateObj(this, "title")
            })

            text.value = obj.title
            text.size = text.value.length
            text.readOnly = true
            tag.appendChild(text)

            var tooltip = document.createElement("textarea")
            tooltip.value = (obj.description != null) ? obj.description : ""
            tooltip.classList.add("tooltip")
            tooltip.size = tooltip.value.length
            tooltip.readOnly = true
            tooltip.setAttribute("oninput", `
                this.style.height = 'auto'
                this.style.height = this.scrollHeight+'px'
                this.scrollTop = this.scrollHeight
                window.scrollTo(window.scrollLeft,(this.scrollTop+this.scrollHeight))
            `)
            tooltip.addEventListener("input", function() {
                updateObj(this, "description")
            })
            tag.appendChild(tooltip)
            
            document.getElementsByTagName("BODY")[0].appendChild(tag)

            tooltip.style.height = 'auto'
            tooltip.style.height = tooltip.scrollHeight+'px'
            tooltip.scrollTop = tooltip.scrollHeight
            break

        case "Info":
            console.log("Info")
            break

        case "Era":
            if (obj == null) {
                var obj =     {
                    "id": objects.length,
                    "class": "Era",
                    "title": "New Era",
                    "description": "Description of this era",
                    "position": 0
                }
                objects.push(obj)
            }

            var tag = document.createElement("div")
            tag.setAttribute( "id", obj.id )
            var desc = (obj.title != null) ? obj.title : ""
            var tooltip = document.createElement("div")
            tooltip.classList.add("tooltip")
            tooltip.innerText = desc
            tag.appendChild(tooltip)

            tag.classList.add("era")
            tag.classList.add("object")
            tag.addEventListener("dblclick", function() { moveObj(tag) })

            tag.style.left = (obj.position + 0.5) + "em"

            var element = document.getElementsByTagName("BODY")[0]
            element.appendChild( tag )
            break

        case "Link":
            var tag = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            var poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline")

            tag.id = obj.id
            poly.style.fill = "none"
            poly.style.strokeWidth = "0.1em"
            var desc = (obj.description != null) ? obj.description : ""
            var tooltip = document.createElement("div")
            tooltip.classList.add("tooltip")
            tooltip.innerText = desc
            tag.appendChild(tooltip)

            tag.addEventListener("dblclick", function() { moveObj(tag) })

            var points = []

            obj.line.forEach(el => {
                var xreq = document.getElementById(objects[el[0]].id)
                var yreq = document.getElementById(objects[el[2]].id)

                var x = xreq.offsetLeft + (xreq.offsetWidth * (el[1] - 0.5) )
                var y = yreq.offsetTop + (yreq.offsetHeight * el[3])
                
                points.push([x, y])
            })

            if (obj.childId == "mouse") {
                
                points.push([window.event.pageX , window.event.pageY])

                document.addEventListener("mousemove", function() {
                    var el = document.getElementById(objects.find(e => e.childId == "mouse").id).children[1]
                    el.setAttribute("points", [el.getAttribute("points").split(",").slice(0, 2), [window.event.pageX , window.event.pageY]])
                })
            }

            poly.setAttribute("points", points)

            if (obj.type != "f"){
                if (objects[obj.parentId].class == "Head") {
                    poly.style.stroke = "#" + objects[obj.parentId].color
                }
                else {
                    poly.style.stroke = "#" + objects[objects[obj.parentId].headId].color
                }
            }
            
            if (obj.type == "f") {
                poly.setAttribute("marker-end", "url(#arrow)")
                poly.style.stroke = "grey"
            }
            else if (obj.type == "c") {
                if (objects[obj.parentId].class == "Head") {
                    poly.setAttribute("marker-end", "url(#" + objects[obj.parentId].color + "-arrow)")
                }
                else {
                    poly.setAttribute("marker-end", "url(#" + objects[objects[obj.parentId].headId].color + "-arrow)")
                }
            }

            tag.appendChild(poly)
            var element = document.getElementsByTagName("BODY")[0]
            element.appendChild(tag)

            break
    }

    tag.addEventListener("mouseover", function() {
        if (window["newArrow"] && document.querySelectorAll(".addLink").length == 0 ) {
            console.log("Over object cheese")
            var linkTop = document.createElement("span")
            linkTop.classList.add("addLink")
            linkTop.id = "linkTop"
            this.appendChild(linkTop)
        
            var linkBottom = document.createElement("span")
            linkBottom.classList.add("addLink")
            linkBottom.id = "linkBottom"
            this.appendChild(linkBottom)
        
            var linkLeft = document.createElement("span")
            linkLeft.classList.add("addLink")
            linkLeft.id = "linkLeft"
            this.appendChild(linkLeft)
        
            var linkRight = document.createElement("span")
            linkRight.classList.add("addLink")
            linkRight.id = "linkRight"
            this.appendChild(linkRight)

            var links = [linkTop, linkBottom, linkLeft, linkRight]
            
            links.forEach(link => {
                link.classList.add("mouseLink")
                link.addEventListener("mouseout", function () {
                    if ( window["newArrow"] && document.elementFromPoint(window.event.pageX, window.event.pageY).classList.contains("object") ) {
                        console.log("Left link button")
                        document.querySelectorAll(".addLink").forEach((button) => {
                            button.remove()
                        })
                    }
                })
            })

        }
    })

    tag.addEventListener("mouseout", function () {
        if ( window["newArrow"] && !document.elementFromPoint(window.event.pageX, window.event.pageY).classList.contains("addLink") ) {
            console.log("Left object " + document.elementFromPoint(window.event.pageX, window.event.pageY).id)
            document.querySelectorAll(".addLink").forEach((button) => {
                button.remove()
            })
        }
    })
}

function updateObj(el, attr) {
    objects[el.parentElement.id][attr] = el.value
}

function updateColor(color) {
    var head = color.parentElement.id

    objects[head].color = color.value.slice(1)

    var toUpdate = objects.filter(e => e.parentId == parseInt(head) || e.headId == parseInt(head) || (e.parentId && objects[e.parentId].headId == parseInt(head) ) )
    toUpdate.push(objects[head])

    toUpdate.forEach(obj => {
        document.getElementById(obj.id).remove()
        newObj(obj.class, obj)
    })
}

document.addEventListener( "click", function (event) {
    if (event.target == null) {
        document.querySelectorAll(".editing").forEach((edit) => {
            edit.classList.remove("editing")
            Array.from(edit.children).forEach(child => {
                child.readOnly = true
            })

            window["editing"] = false
        })

        document.querySelectorAll(".addLink").forEach((button) => {
            button.remove()
        })
        
        return
    }

    if ( event.target.classList.contains("addLink") && !window["newArrow"] ) {
        window["newArrow"] = true

        var coords = [0, 0.5]
        if ( event.target.id == "linkRight" ) coords = [1, 0.5]
        if ( event.target.id == "linkTop" ) coords = [0.5, 0]
        if ( event.target.id == "linkBottom" ) coords = [0.5, 1]

        var obj = {
            "id": objects.length,
            "class": "Link",
            "line": [
                [
                    parseInt(event.target.parentElement.id),
                    coords[0],
                    parseInt(event.target.parentElement.id),
                    coords[1]
                ]
            ],
            "parentId": parseInt(event.target.parentElement.id),
            "childId": "mouse",
            "type": "c"
        }
        objects.push(obj)

        newObj("Link", obj)
    }
    else if ( event.target.classList.contains("addLink") && window["newArrow"] ) {
        window["newArrow"] = false

        var coords = [0, 0.5]
        if ( event.target.id == "linkRight" ) coords = [1, 0.5]
        if ( event.target.id == "linkTop" ) coords = [0.5, 0]
        if ( event.target.id == "linkBottom" ) coords = [0.5, 1]

        var obj = objects.find(obj => obj.childId === "mouse")

        obj.childId = parseInt(event.target.parentElement.id)

        if ( ["linkLeft", "linkRight"].includes(event.target.id) && objects[obj.parentId].position[1] !== objects[obj.childId].position[1] ) {
            obj.line.push(
                [
                    obj.line[0][0],
                    obj.line[0][1],
                    parseInt(event.target.parentElement.id),
                    coords[1]
                ]
            )

        }
        else if ( ["linkTop", "linkBottom"].includes(event.target.id) && objects[obj.parentId].position[0] !== objects[obj.childId].position[0] ) {
            obj.line.push(
                [
                    parseInt(event.target.parentElement.id),
                    coords[0],
                    obj.line[0][2],
                    obj.line[0][3]
                ]
            )
        }

        obj.line.push(
            [
                parseInt(event.target.parentElement.id),
                coords[0],
                parseInt(event.target.parentElement.id),
                coords[1]
            ]
        )

        document.getElementById(obj.id).remove()

        newObj("Link", obj)
    }

    if (Array.from(document.querySelectorAll(".editing")).includes(document.activeElement.parentElement)) {
        document.querySelectorAll(".addLink").forEach((button) => {
            button.remove()
        })
    }

    if (!(event.target.classList.contains("editing") || event.target.parentElement.classList.contains("editing")) && !event.ctrlKey) {
        document.querySelectorAll(".editing").forEach((edit) => {
            edit.classList.remove("editing")
            Array.from(edit.children).forEach(child => {
                child.readOnly = true
            })

            window["editing"] = false
        })
        document.querySelectorAll(".addLink").forEach((button) => {
            button.remove()
        })
    }
    else if (event.target.classList.contains("object") || event.target.parentElement.classList.contains("object")) {
        var obj = (event.target.classList.contains("object")) ? event.target : event.target.parentElement

        obj.classList.toggle("editing")
        Array.from(obj.children).forEach(child => {
            child.readOnly = false
        })
        window["editing"] = true

        var els = document.querySelectorAll(".editing")

        document.querySelectorAll(".addLink").forEach((button) => {
            button.remove()
        })

        if (els.length == 1 && !els[0].classList.contains("era")) {
            var linkTop = document.createElement("span")
            linkTop.classList.add("addLink")
            linkTop.id = "linkTop"
            els[0].appendChild(linkTop)
        
            var linkBottom = document.createElement("span")
            linkBottom.classList.add("addLink")
            linkBottom.id = "linkBottom"
            els[0].appendChild(linkBottom)
        
            var linkLeft = document.createElement("span")
            linkLeft.classList.add("addLink")
            linkLeft.id = "linkLeft"
            els[0].appendChild(linkLeft)
        
            var linkRight = document.createElement("span")
            linkRight.classList.add("addLink")
            linkRight.id = "linkRight"
            els[0].appendChild(linkRight)
        }
    }

    if ( event.target.getAttribute("id") == "addmenu" || event.target.parentElement.getAttribute("id") == "addmenu") {
        if (document.getElementById("addmenu").classList.contains("open")) {
            document.getElementById("addmenu").classList.remove("open")
        }
        else {
            document.getElementById("addmenu").classList.add("open")
        }
    }

    if (event.target.classList.contains("addClassObj")) {
        document.getElementById("addmenu").classList.remove("open")
        newObj(event.target.innerHTML)
    }
}, false)

document.onkeydown = (event) => {
    if (event.ctrlKey && event.key == "s") {
        event.preventDefault()

        var data = JSON.stringify(objects)

        if (window["encrypted"]) {
            data = encrypt(data, window["key"])
        }

        console.log("Saving...")

        var request = require("request")

        var options = { method: 'PATCH',
        url: 'https://timelines-3cbe.restdb.io/rest/timelines/' + window["id"],
        headers: 
        { 'cache-control': 'no-cache',
            'x-apikey': RestDB_API,
            'content-type': 'application/json' },
        body: { map: data },
        json: true }

        request(options, function (error, response, body) {
        if (error) throw new Error(error)

        console.log(body)
        })

        console.log("Saved")
    }

    if ( window["newArrow"] && ["c", "f", "e"].includes(event.key) ) {
        var obj = objects.find(obj => obj.childId === "mouse")

        obj.type = event.key

        var el = document.getElementById(obj.id).children[1]
        points = el.getAttribute("points")

        document.getElementById(obj.id).remove()
        newObj("Link", obj)

        var el = document.getElementById(obj.id).children[1]
        el.setAttribute("points", points)
    }

    if( ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.key) && window["editing"] ) {
        var els = document.querySelectorAll(".editing")

        if (Array.from(els).includes(document.activeElement.parentElement)) {
            return
        }

        event.preventDefault()

        els.forEach(el => {
            var updated = 5

            if ( ["ArrowUp","ArrowLeft"].includes(event.key) ) {
                updated = -5
            }

            var elObj = objects[el.getAttribute("id")]

            if ( ["ArrowLeft","ArrowRight"].includes(event.key) ) {
                if (elObj.class != "Era") {
                    updated += Number(el.style.marginLeft.slice(0, el.style.marginLeft.length - 2))
                }
                else {
                    updated += Number(el.style.left.slice(0, el.style.left.length - 2))
                }

                if (updated >= 0) {
                    if (elObj.class != "Era") {
                        el.style.marginLeft = updated + "em"
                        elObj.position[0] = updated
                    }
                    else {
                        el.style.left = updated + "em"
                        elObj.position = updated
                    }
                }
            }
            else {
                updated += Number(el.style.marginTop.slice(0, el.style.marginTop.length - 2))

                if (updated >= 0 && elObj.class != "Era") {
                    el.style.marginTop = updated + "em"
                    elObj.position[1] = updated
                }
                else if (elObj.class == "Era") {
                    elObj.position = updated
                }
            }

            var toUpdate = objects.filter(e => e.parentId == el.getAttribute("id") || e.childId == el.getAttribute("id") )

            toUpdate.forEach(element => {
                console.log(element.id)
                var points = []

                element.line.forEach(line => {
                    var xreq = document.getElementById(objects[line[0]].id)
                    var yreq = document.getElementById(objects[line[2]].id)

                    var x = xreq.offsetLeft + (xreq.offsetWidth * (line[1] - 0.5) )
                    var y = yreq.offsetTop + (yreq.offsetHeight * line[3])
                    
                    points.push([x, y])
                })

                document.getElementById(element.id).children[1].setAttributeNS(null, "points", points)
            })
        })

        els[0].scrollIntoView({
            block: "nearest",
            inline: "center"
        })
    }
    else if (event.key == "Enter" && window["editing"]) {
        event.preventDefault()

        document.querySelectorAll(".editing").forEach(edit => {
            edit.classList.remove("editing")
            Array.from(edit.children).forEach(child => {
                child.readOnly = true
            })
        })
    }
    else if (Array.from(document.querySelectorAll(".editing")).includes(document.activeElement.parentElement)) {
        setTimeout(function (){
            var el = document.activeElement.parentElement

            var toUpdate = objects.filter(e => e.parentId == el.getAttribute("id") || e.childId == el.getAttribute("id") )
    
            toUpdate.forEach(element => {
                console.log(element.id)
                var points = []
    
                element.line.forEach(line => {
                    var xreq = document.getElementById(objects[line[0]].id)
                    var yreq = document.getElementById(objects[line[2]].id)
    
                    var x = xreq.offsetLeft + (xreq.offsetWidth * (line[1] - 0.5) )
                    var y = yreq.offsetTop + (yreq.offsetHeight * line[3])
                    
                    points.push([x, y])
                })
    
                document.getElementById(element.id).children[1].setAttributeNS(null, "points", points)
            })
          }, 10)
    }
}

function moveObj(obj) {
    console.log(obj)

    document.querySelectorAll(".addLink").forEach((button) => {
        button.remove()
    })

    document.querySelectorAll(".editing").forEach(edit => {
        edit.classList.remove("editing")
        Array.from(edit.children).forEach(child => {
            child.readOnly = true
        })
    })

    obj.classList.add("editing")

    if (obj !== document.activeElement.parentElement && !obj.classList.contains("era") ) {
        var linkTop = document.createElement("span")
        linkTop.classList.add("addLink")
        linkTop.id = "linkTop"
        obj.appendChild(linkTop)

        var linkBottom = document.createElement("span")
        linkBottom.classList.add("addLink")
        linkBottom.id = "linkBottom"
        obj.appendChild(linkBottom)

        var linkLeft = document.createElement("span")
        linkLeft.classList.add("addLink")
        linkLeft.id = "linkLeft"
        obj.appendChild(linkLeft)

        var linkRight = document.createElement("span")
        linkRight.classList.add("addLink")
        linkRight.id = "linkRight"
        obj.appendChild(linkRight)
    }

    Array.from(obj.children).forEach(child => {
        child.readOnly = false
    })

    window["editing"] = true
}

var objects = []

var options = {
  method: "GET",
  url: "https://timelines-3cbe.restdb.io/rest/timelines",
  headers: {
    "cache-control": "no-cache",
    "x-apikey": RestDB_API,
  },
}

request(options, function (error, response, body) {
  if (error) throw new Error(error)

  var maps = JSON.parse(body)

  var url = new URL(window.location.href)
  window["id"] = url.searchParams.get("id")

  var map = maps.find(e => e._id === window["id"])

  if (map) {
    window["encrypted"] = map.encrypted

    console.log("Title: " + map.title)
    console.log("Description: " + map.description)
    console.log("Encrypted: " + window["encrypted"])

    if (window["encrypted"]) {
        document.getElementById("popup").style = "visibility: visible"
        document.getElementById("subKey").addEventListener("click", function() {
            objects = JSON.parse( decrypt( map.map, document.getElementById("key").value ) )

            if (window["ready"]) {
                display()
            }
            else {
                window["ready"] = true
            }

            window["key"] = document.getElementById("key").value
            document.getElementById("popup").style = null
        })
    }
    else {
        objects = JSON.parse(map.map)

        if (window["ready"]) {
            display()
        }
        else {
            window["ready"] = true
        }
    }
  }
  else {
    console.log("Invalid ID")
  }
})