/*  

This code is based on following convention:

https://github.com/bumbeishvili/d3-coding-conventions

*/

function renderChart(params) {

  // exposed variables
  var attrs = {
    svgWidth: 400,
    svgHeight: 400,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    marginLeft: 5,
    container: 'body',
    data: null,
    hierarchyData: {
      "name": "",
      "children": []
    },
    cnfg: {
      diameter: 600
    }
  };

  /*############### IF EXISTS OVERWRITE ATTRIBUTES FROM PASSED PARAM  #######  */

  var attrKeys = Object.keys(attrs);
  attrKeys.forEach(function (key) {
    if (params && params[key]) {
      attrs[key] = params[key];
    }
  })

  //innerFunctions which will update visuals
  var updateData;

  //main chart object
  var main = function (selection) {
    selection.each(function scope() {
      
      var metronikPalette = {
        group1 : ["#32C5D2","#36D7B7","#1BBC9B","#1BA39C","#26C281"],  // green
        group2 : ["#3598DC","#578EBE","#67809F","#4B77BE","#2C3E50"],  // blue
        group3 : ["#E08283","#F36A5A","#EF4836","#E43A45","#D91E18"],  // red
        group5 : ["#C8D046","#F4D03F","#E87E04","#F2784B","#C49F47"],  // yellow
        group6 : ["#8877A9","#9B59B6","#BF55EC","#8E44AD","#9A12B3"],  // purple
        group4 : ["#BFCAD1","#ACB5C3","#95A5A6","#555555","#525E64"]   // gray
     }

      //calculated properties
      var calc = {}
      calc.chartLeftMargin = attrs.marginLeft;
      calc.chartTopMargin = attrs.marginTop;
      calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
      calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;

      var diameter = attrs.cnfg.diameter;
      var radius = diameter / 2;
      var innerRadius = radius - 70;
      var gradientCounter = 0;

      //drawing containers
      var container = d3.select(this);

      //add svg
      var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
        .attr('width', diameter)
        .attr('height', diameter)
      // .attr("viewBox", "0 0 " + attrs.svgWidth + " " + attrs.svgHeight)
      // .attr("preserveAspectRatio", "xMidYMid meet")

      var svgDefs = svg.append("svg:defs");

      //add container g element
      var chart = svg.patternify({ tag: 'g', selector: 'chart' })
        .attr('transform', 'translate(' + radius + ',' + radius + ')');


      var cluster = d3.cluster()
        .size([360, innerRadius])
        .separation(function (a, b) { return (a.parent == b.parent ? 1 : a.parent.parent == b.parent.parent ? 2 : 4); });

      var line = d3.line()
        .x(xAccessor)
        .y(yAccessor)
        .curve(d3.curveBundle.beta(0.7));

      processData()

      var idToNode = {};

      attrs.data.nodes.forEach(function (n) {
        idToNode[n.id] = n;
      });

      attrs.data.links.forEach(function (e) {
        e.source = idToNode[e.source];
        e.target = idToNode[e.target];
      });

      
      var tree = cluster(d3.hierarchy(attrs.hierarchyData));


      debugger;
      var leaves = tree.leaves();
      var paths = attrs.data.links.map(function (l) {
        var source = leaves.filter(function (d) { return d.data === l.source; })[0];
        var target = leaves.filter(function (d) { return d.data === l.target; })[0];
        return source.path(target);
      });


      var link = chart.patternify({ tag: 'path', selector: 'link', data : paths })
          link.attr('d', function (d) { return line(d) })
              .style("stroke", function (d) {
                debugger; d;
                console.log("  d[0].data.linksNumber  " + d[0].data.linksNumber +
                            "  d[d.length-1].data.linksNumber  "  + d[d.length-1].data.linksNumber+ 
                            "  d[0].data.groupNo  " + d[0].data.groupNo+
                            "  d[d.length-1].data.groupNo  "+ d[d.length-1].data.groupNo);

                var gradient =  getGradient(d[0].data.linksNumber, d[d.length-1].data.linksNumber, d[0].data.groupNo, d[d.length-1].data.groupNo)
                 return 'url(#' + gradient + ')';
              })
              // .on('mouseover', function (l) {
              //       link.style('stroke', null)
              //         .style('stroke-opacity', null);

              //       d3.select(this)
              //         .style('stroke', '#d62333')
              //         .style('stroke-opacity', 1);

              //       node.selectAll('circle')
              //         .style('fill', null);

              //       node.filter(function (n) { return n === l[0] || n === l[l.length - 1]; })
              //         .selectAll('circle')
              //         .style('fill', 'black');
              // })
              // .on('mouseout', function (d) {
              //       link.style('stroke', null)
              //         .style('stroke-opacity', null);
              //       node.selectAll('circle')
              //         .style('fill', null);
              // });

    

      var node = chart.patternify({ tag: 'g', selector: 'node', data : tree.leaves() })
          node.attr('transform', function (d) { return 'translate(' + xAccessor(d) + ',' + yAccessor(d) + ')'; })

        //  node.on('mouseover', function (d) {
        //             node.style('fill', null);
        //             d3.select(this).selectAll('circle').style('fill', 'black');

        //             var nodesToHighlight = paths.map(function (e) { return e[0] === d ? e[e.length - 1] : e[e.length - 1] === d ? e[0] : 0 })
        //                                         .filter(function (d) { return d; });
                  
        //             node.filter(function (d) { return nodesToHighlight.indexOf(d) >= 0; })
        //                 .selectAll('circle')
        //               .style('fill', '#555');
                    
        //             link.style('stroke-opacity', function (link_d) {
        //               return link_d[0] === d | link_d[link_d.length - 1] === d ? 1 : null;
        //             })
        //             .style('stroke', function (link_d) {
        //               return link_d[0] === d | link_d[link_d.length - 1] === d ? '#d62333' : null;
        //             });
        //       })
        //       .on('mouseout', function (d) {
        //               link
        //                 .style('stroke-opacity', null)
        //                 .style('stroke', null);
        //               node.selectAll('circle')
        //                 .style('fill', null);
        //       });



        
      node.append('rect')
      .attr('width', 8)
      .attr('height', d => (d.data.linksNumber + 1) * 5)
      .attr('x', -4)
      .attr('y', function (d) { return -((d.data.linksNumber + 1) * 5) - 3 })
      .style("fill", function(d){
          return getColor(d.data.groupNo, d.data.linksNumber)
       })
      .attr('transform', function (d) {return 'rotate(' + d.x + ')'; })


      node.append('text')
        .attr('dy', '0.32em')
        .attr('x', function (d) { return d.x < 180 ? ((d.data.linksNumber + 1) * 5) + 5 : -((d.data.linksNumber + 1) * 5) - 5; })
        .style('text-anchor', function (d) { return d.x < 180 ? 'start' : 'end'; })
        .attr('transform', function (d) { return 'rotate(' + (d.x < 180 ? d.x - 90 : d.x + 90) + ')'; })
        .text(function (d) { return d.data.name; })
        .style("fill", function(d){
          return getColor(d.data.groupNo, null)
        })


      function processData() {

        var uniqueGroups = [...new Set(attrs.data.nodes.map(item => item.group))];
        
        var copyArray = attrs.data.nodes.slice(0);

        attrs.data.nodes = copyArray.map(function(d){
          return {
                id : d.id,
                name : d.name,
                group : d.group,
                groupNo : uniqueGroups.indexOf(d.group)+1,
                linksNumber : attrs.data.links.filter(l => l.source == d.id).length
              }
        })

       var nested_data = d3.nest()
          .key(function (d) { return d.group; })
          .entries(attrs.data.nodes);

        var mappedData = nested_data.map(function (d) {
          return {
            "name": d.key,
            "children": d.values
          }
        })

        attrs.hierarchyData.children = mappedData;

       

        console.log(attrs.hierarchyData);
        console.log(uniqueGroups);
      }


      function chapterCompare(aChaps, bChaps) {
        if (aChaps[0] != bChaps[0])
          return bChaps[0] - aChaps[0];
        else if (aChaps[1] != bChaps[0])
          return bChaps[1] - aChaps[1];
        else if (aChaps[2] != bChaps[2])
          return bChaps[2] - aChaps[2];
        return 0;
      }


      function chapterHierarchy(characters) {
        var hierarchy = {
          root: { name: 'root', children: [] }
        };

        characters.forEach(function (c) {
          var chapter = c.firstChapter;

          var book = c.firstChapter.substring(0, c.firstChapter.lastIndexOf('.'));

          var volume = book.substring(0, book.lastIndexOf('.'));

          if (!hierarchy[volume]) {
            hierarchy[volume] = { name: volume, children: [], parent: hierarchy['root'] };
            hierarchy['root'].children.push(hierarchy[volume]);
          }
          if (!hierarchy[book]) {
            hierarchy[book] = { name: book, children: [], parent: hierarchy[volume] };
            hierarchy[volume].children.push(hierarchy[book]);
          }
          if (!hierarchy[chapter]) {
            hierarchy[chapter] = { name: chapter, children: [], parent: hierarchy[book] };
            hierarchy[book].children.push(hierarchy[chapter]);
          }

          c.parent = hierarchy[chapter];
          hierarchy[chapter].children.push(c);
        });
        debugger;
        return hierarchy['root'];
      }


      function xAccessor(d) {
        var angle = (d.x - 90) / 180 * Math.PI, radius = d.y;
        return radius * Math.cos(angle);
      }
      function yAccessor(d) {
        var angle = (d.x - 90) / 180 * Math.PI, radius = d.y;
        return radius * Math.sin(angle);
      }

      function getColor(group, linksNumber) { // group -  1 or 2 or 3 ....
        var color = '#ccc'

        if (linksNumber == null || linksNumber <= 3) {
          color = metronikPalette["group"+group][0]
        } else if (linksNumber > 3 && linksNumber <= 15) {
          color = metronikPalette["group"+group][1]
        } else if (linksNumber > 15 && linksNumber <= 25) {
          color = metronikPalette["group"+group][2]
        } else if (linksNumber > 25 && linksNumber <= 35) {
          color = metronikPalette["group"+group][3]
        } else if (linksNumber > 35) {
          color = metronikPalette["group"+group][4]
        }
       
        return color;
    }
    
      function getGradient(startlinksNumber, endlinksNumber, startGroup, endGroup) {
      
          var gradientId = "gradient" + gradientCounter;
      
          var gradient = svgDefs.append("svg:linearGradient")
              .attr("id", gradientId);
      
          gradient.append("svg:stop")
              .attr("offset", "10%")
              .attr("stop-color", getColor(startGroup, startlinksNumber))
      
          gradient.append("svg:stop")
              .attr("offset", "90%")
              .attr("stop-color", getColor(endGroup, endlinksNumber))
      
          gradientCounter++;
      
          return gradientId;
      }


      // smoothly handle data updating
      updateData = function () {

      }
      //#########################################  UTIL FUNCS ##################################

      function debug() {
        if (attrs.isDebug) {
          //stringify func
          var stringified = scope + "";

          // parse variable names
          var groupVariables = stringified
            //match var x-xx= {};
            .match(/var\s+([\w])+\s*=\s*{\s*}/gi)
            //match xxx
            .map(d => d.match(/\s+\w*/gi).filter(s => s.trim()))
            //get xxx
            .map(v => v[0].trim())

          //assign local variables to the scope
          groupVariables.forEach(v => {
            main['P_' + v] = eval(v)
          })
        }
      }
      debug();
    });
  };

  //----------- PROTOTYEPE FUNCTIONS  ----------------------
  d3.selection.prototype.patternify = function (params) {
    var container = this;
    var selector = params.selector;
    var elementTag = params.tag;
    var data = params.data || [selector];

    // pattern in action
    var selection = container.selectAll('.' + selector).data(data)
    selection.exit().remove();
    selection = selection.enter().append(elementTag).merge(selection)
    selection.attr('class', selector);
    return selection;
  }

  //dinamic keys functions
  Object.keys(attrs).forEach(key => {
    // Attach variables to main function
    return main[key] = function (_) {
      var string = `attrs['${key}'] = _`;
      if (!arguments.length) { return eval(` attrs['${key}'];`); }
      eval(string);
      return main;
    };
  });

  //set attrs as property
  main.attrs = attrs;

  //debugging visuals
  main.debug = function (isDebug) {
    attrs.isDebug = isDebug;
    if (isDebug) {
      if (!window.charts) window.charts = [];
      window.charts.push(main);
    }
    return main;
  }

  //exposed update functions
  main.data = function (value) {
    if (!arguments.length) return attrs.data;
    attrs.data = value;
    if (typeof updateData === 'function') {
      updateData();
    }
    return main;
  }

  // run  visual
  main.run = function () {
    d3.selectAll(attrs.container).call(main);
    return main;
  }

  return main;
}
