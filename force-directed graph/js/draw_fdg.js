let _width = $(window).width();
let _height = $(window).height();
let fdg_width = 512;
let fdg_height = 512;

fdg_nspecs = []
fdg_lspecs = []

// define colors
let fdg_def = "#99ffff" //default
let fdg_high = "#ff3366" //highlight
let fdg_hover = "#ffff00" //mouseover
let fdg_line_def = "#a0a0a0"
let fdg_line_high = "#cc66cc"

function fdg_color(idx, specs=fdg_nspecs) {
    // highlight circle if idx is in specs
    if (specs) {
        if (specs.indexOf(idx) > 0) {
            return fdg_high
        }
    }
    return fdg_def
}

function fdg_line_color(efrom, eto, specs=fdg_lspecs) {
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
        return fdg_line_high
    }
    return fdg_line_def
}

function fdg_line_opacity(n) {
    // less transparent for more links
    // let val = 0.3+n/900
    return 0.5
}

function fdg_radius(n) {
    // larger radius for more links
    let val = 0.15*Math.log2(n)+n/1500
    return 3+val
}

function draw_fdg(data) {
    let svg = d3.select('#container')
        .select('svg')
        .attr('width', fdg_width)
        .attr('height', fdg_height);

    // let color = d3.scaleOrdinal(d3.schemeCategory10);

    let links = data.links;
    let nodes = data.nodes;

    let simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(30))
        .force("charge", d3.forceManyBody().strength(-10).distanceMax(0.2*fdg_height))
        .force("center", d3.forceCenter(fdg_width/2, fdg_height/2))

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
        .attr("stroke", fdg_line_def)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-opacity", d => fdg_line_opacity(d.value))
        .attr("stroke-width", d => Math.sqrt((1+Math.log2(d.value))));

    // nodes
    let node = svg.append("g")
        .attr("stroke", "#505050")
        .attr("stroke-width", 0.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => fdg_radius(d.sum))
        .attr("fill", fdg_def)
        .attr("opacity", 0.75)
        .on("mouseover", function(d,i){
            d3.select(this).attr("fill", fdg_hover)
        })
        .on("mouseout", function(d,i){
            d3.select(this).attr("fill", d => fdg_color(d.id))
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
    fdg_nspecs = []
    fdg_lspecs = []
    for (var i in lnks) {
        if (i<emls.length && emls[i]==1) {
            efrom = lnks[i][0];
            eto = lnks[i][1];
            fdg_lspecs.push([efrom, eto]);
            fdg_nspecs.push(efrom);
            fdg_nspecs.push(eto);
        }
    }
    link.attr("stroke", d => fdg_line_color(d.source.id, d.target.id))
    node.attr("fill", d => fdg_color(d.id))
}

function fdg_reset_highlight(link, node) {
    link.attr("stroke", fdg_line_def)
    node.attr("fill", fdg_def)
}

function fdg_wrapper() {
    // use this function to draw a force-directed graph
    return draw_fdg(fdg_dat);
}

function fdg_highlight_wrapper(fdg, emls) { 
    // use this function to highlight all emails if emls[i]==1
    fdg_highlight(fdg[0], fdg[1], fdg_lnk, emls)
}

function fdg_reset_wrapper(fdg) {
    // use this function to reset highlight (no node/line highlight)
    fdg_reset_highlight(fdg[0], fdg[1])
}

fdg = fdg_wrapper()
/*
// usage example
emls = []
for (var i=1; i<5068; i=i+1) {
    if (i<10) {emls.push(1);}
    else {emls.push(0);}
}
fdg_highlight_wrapper(fdg, emls)
// fdg_reset_wrapper(fdg)
*/
