let _width = $(window).width();
let _height = $(window).height();
let width = 512;
let height = 512;

function fdg_color(idx, specs) {
    // highlight circle if idx is in specs
    if (specs) {
        if (specs.indexOf(idx) > 0) {
            return d3.rgb(255,255,0)
        }
    }
    return d3.rgb(51,102,204)
}

function fdg_line_color(efrom, eto, specs) {
    // highlight circle if efrom,eto are in specs
    flag = 0;
    for (let i=0; i<specs.length; i=i+1) {
        id = i.toString()
        n0 = specs[id][0];
        n1 = specs[id][1];
        if ((efrom==n0 && eto==n1)||(efrom==n1 && eto==n0)) {
            flag = 1; break;
        }
    }
    if (flag > 0) {
        return d3.rgb(255,162,51)
    }
    return d3.rgb(144,144,144)
}

function fdg_line_opacity(n) {
    // less transparent for more links
    let val = 0.3+n/900
    return val
}

function fdg_radius(n) {
    // larger radius for more links
    let val = 0.15*Math.log2(n)+n/1500
    return 3+val
}

function draw_fdg(data) {
    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    // let color = d3.scaleOrdinal(d3.schemeCategory10);

    let links = data.links;
    let nodes = data.nodes;

    let simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(30))
        .force("charge", d3.forceManyBody().strength(-10).distanceMax(0.2*height))
        .force("center", d3.forceCenter(width/2, height/2))

    // apply forces when dragging
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.1).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // links
    let link = svg.append("g")
        .attr("stroke", "#909090")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-opacity", d => fdg_line_opacity(d.value))
        .attr("stroke-width", d => Math.sqrt((1+Math.log2(d.value))));

    // nodes
    let node = svg.append("g")
        .attr("stroke", "#d0d0d0")
        .attr("stroke-width", 0.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => fdg_radius(d.sum))
        .attr("fill", "#3366cc")
        .attr("opacity", 0.75)
        .on("mouseover", function(d,i){
            d3.select(this).attr("fill", "#ffff00")
        })
        .on("mouseout", function(d,i){
            d3.select(this).attr("fill", "#3366cc")
        })
        .call(drag(simulation));

    // title
    node.append("title").text(function(d,i){
        return d.id + '\n' + 'Total links: ' + d.sum;
    })

    // draw links&nodes
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    return [link, node]
}


function fdg_highlight(link, node, lnks, emls) {
    nspecs = []
    lspecs = []
    for (let i=0; i<emls.length; i=i+1) {
        id = emls[i]
        efrom = lnks[id][0];
        eto = lnks[id][1];
        lspecs.push([efrom, eto]);
        nspecs.push(efrom)
        nspecs.push(eto)
    }
    link.attr("stroke", d => fdg_line_color(d.source.id, d.target.id, lspecs))
    node.attr("fill", d => fdg_color(d.id, nspecs))
}

function fdg_reset_highlight(link, node) {
    link.attr("stroke", "#ff3366")
    node.attr("fill", "#ffff00")
}

function fdg_wrapper() {
    // use this function to draw a force-directed graph
    return draw_fdg(fdg_dat);
}

function fdg_highlight_wrapper(fdg, emls) {
    // use this function to highlight all emails in emls
    fdg_highlight(fdg[0], fdg[1], fdg_lnk, emls)
}

function fdg_reset_wrapper(fdg) {
    // use this function to reset highlight (no node/line highlight)
    fdg_reset_highlight(fdg[0], fdg[1])
}

fdg = fdg_wrapper()
// fdg_highlight_wrapper(fdg, [1,2,3])