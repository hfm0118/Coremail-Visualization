let data = null;
let data_file = './data/result.csv';

function get_min_max(data, attr) {
    let min = 1e9;
    let max = 0;
    data.forEach(d => {
        let v = parseFloat(d[attr]);
        if (v > max)
            max = v;
        if (v < min)
            min = v;
    });
    console.log('attr', attr, 'min', min, 'max', max);

    return [0, max];
}
let _width = $(window).width();
let _height = $(window).height();
let x_attr = 'timeuse';
let y_attr = 'result';
let fontFamily;

function set_ui() {
    // 设置字体
    let ua = navigator.userAgent.toLowerCase();
    fontFamily = "Khand-Regular";//字体
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    d3.select("body")
        .style("font-family", fontFamily);
}

function draw_main(x0, y0, width, height) {
    let padding = {'left': 0.2*width, 'bottom': 0.1*height, 'top': 0.2*height, 'right': 0.1*width};
    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height)
        .attr("transform", `translate(${x0},${y0})`);

    // title
    svg.append('g')
        .attr('transform', `translate(${padding.left+(width-padding.left-padding.right)/2}, ${padding.top*0.4})`)
        .append('text')
        .attr('class', 'title')
        .text('coremail散点图可视化部分');

    // x axis - phd graduation year
    let x = d3.scaleLinear()
        .domain([2013,2019])
        .range([padding.left, width-padding.right]);    
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(7)
        .tickFormat(d => d);

    // y axis - publications
    let y = d3.scaleLinear()
        .domain(get_min_max(data, y_attr))
        .range([height-padding.bottom, padding.top]);    
    let axis_y = d3.axisLeft()
        .scale(y)
        .ticks(10)
        .tickFormat(d => d);

    // x axis
    svg.append('g')
        .attr('transform', `translate(${0}, ${height-padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem')

    svg.append('g')
        .attr('transform', `translate(${padding.left+(width-padding.left-padding.right)/2}, ${height-padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.08*height)
        .text("时间");

    // y axis
    svg.append('g')        
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(axis_y)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem')
    svg.append('g')
        .attr('transform', `
            translate(${padding.left}, ${height/2})
            rotate(-90)    
        `)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height*0.07)
        .text("伪造水平");

    // points
    svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('class', 'point')
        .attr('cx', (d, i) => {
            //console.log('data', d); 
            return x(parseFloat(d[x_attr]));
        })
        .attr('cy', (d, i) => y(parseFloat(d[y_attr])))
        .attr('id',(d,i)=>parseInt(d["ID"]))
        .attr('r', 10)
        .attr('fill', '#B1BDC5')
        .attr('stroke', 'none')
        .attr('opacity', 0.7)
        .on('mouseover', function(d,e)  {
            //console.log('e', e, 'd', d)

            // show a tooltip
            //console.log('data', d);
            let content ='<table><tr><td>Received</td><td>' + e["c1"]+'</td/tr>'+
            '<tr><td>From</td><td>' + e["c2"]+'</td/tr>'+
            '<tr><td>To</td><td>' + e["c3"]+'</td/tr>'+
            '<tr><td>Date</td><td>' + e["c4"]+'</td/tr>'+
            '<tr><td>Authentication-Results</td><td>' + e["c5"]+'</td/tr>'+
            '<tr><td>Sender</td><td>' + e["c6"]+'</td/tr>'+
            '<tr><td>DKIM-Signature</td><td>' + e["c7"]+'</td/tr>'+
            '<tr><td>Return-Path</td><td>' + e["c8"]+'</td/tr>'+
            '<tr><td>X-Return-Path</td><td>' + e["c9"]+
            '</td></tr></table>';
            // tooltip
            let tooltip = d3.select('#tooltip');            
            tooltip.html(content)
                .style('left', (x(parseInt(e[x_attr])) + 5)+ 'px')
                .style('top', (y(parseInt(e[y_attr])) + 5)+ 'px')
                //.transition().duration(500)
                .style('visibility', 'visible');
            d3.select(this) 
                .attr('stroke', '#ff6a33')
                
        })
        .on('mouseout', function(d) {
            // remove tooltip
            let tooltip = d3.select('#tooltip');            
            tooltip.style('visibility', 'hidden');           
            d3.select(this)
                .attr("fill", "#B1BDC5")    
                .attr('stroke', 'none')
                
        })
        .on('click',(e,d)=>{
            let content1=d["content"]
            let time=d["time"]
            let rule1=d["rule1"]
            let rule2=d["rule2"]
            let rule3=d["rule3"]
            let rule4=d["rule4"]
            let rule5=d["rule5"]
            let rule6=d["rule6"]
            let rule7=d["rule7"]
            let rule8=d["rule8"]
            let rule9=d["rule9"]
            let s="时间：\n   "+time+"\n"+"伪造水平:\n     "+d["result"]+"\n"+"具体情况:\n     "
            if(rule1==1){
                s=s+"1.smtp.mail与From的发件人不同\n     "
            }
            if(rule2==1){
                s=s+"2.SPF的记录结果不为pass\n     "
            }
            if(rule3==1){
                s=s+"3.出现多个From字段\n     "
            }
            if(rule4==1){
                s=s+"4.Sender与From存在差异\n     "
            }
            if(rule5==1){
                s=s+"5.存在部分特殊的字符\n     "
            }
            if(rule6==1){
                s=s+"6.dkim.d和From不一致\n     "
            }
            if(rule7==1){
                s=s+"7.Authentication-Results字段里的header.i和stmp.mail域名不一致\n     "
            }
            if(rule8==1){
                s=s+"8.Return-Path和From不一致\n     "
            }
            if(rule9==1){
                s=s+"9.X-Return-Path和From不一致\n"
            }
            s=s+"邮件序号:\n     "+d["ID"]
            alert(s);
        })
}

function main() {
    d3.csv(data_file).then(function(DATA) {
        data = DATA;
        // remove data without x_attr or y_attr
        data = data.filter((d, i) => (d[x_attr] != '' && d[y_attr] != ''));
        set_ui();
        draw_main(0,0,0.9 * _width,0.96 * _height);//修改位置及svg大小
    })
}

main()